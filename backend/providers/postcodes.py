"""
The only place T-SMILE talks to postcodes.io.

postcodes.io is the standard free UK postcode lookup. It needs no API key and
no account, which is why it is here rather than a paid geocoder.

Two callers, doing two different jobs:

  * the geocode_providers command, once, in bulk, to place our providers on
    the map, falling back to retired postcodes for the ones bulk misses;
  * the search view, once per visitor search, to turn the postcode they typed
    into a point to measure from.

Nothing else calls it, and a search never looks up a provider's postcode: the
providers already carry their coordinates. Moving to another lookup service
means rewriting this one file.
"""
import json
import logging
import re
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)

API_ROOT = "https://api.postcodes.io"

# postcodes.io rejects a bulk request longer than this, so we send several.
BULK_LIMIT = 100

# A visitor is waiting on the single lookup, so fail fast rather than hang.
TIMEOUT_SECONDS = 10

# The loosest shape a UK postcode can take: one or two letters, then the rest.
# This is a cheap sanity check, not validation. postcodes.io decides whether a
# postcode really exists; this only stops obvious rubbish (and anything long
# or odd enough to be an attempt at a different URL) leaving our server.
POSTCODE_PATTERN = re.compile(r"^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$")


class PostcodeServiceUnavailable(Exception):
    """postcodes.io could not be reached, or answered with something unusable."""


def normalise(postcode):
    """
    Upper case with the spaces taken out, e.g. " sw1a 1aa " -> "SW1A1AA".

    Used both as the cache key for a bulk lookup and as the value we send, so
    the same postcode typed three different ways is looked up once.
    """
    return re.sub(r"\s+", "", str(postcode)).upper()


def looks_like_a_postcode(postcode):
    """True when the text has the shape of a UK postcode. Cheap, local, no call."""
    return bool(POSTCODE_PATTERN.match(normalise(postcode)))


def _call(path, payload=None):
    """
    One request to postcodes.io. GET when there is no payload, POST when there
    is. Returns the decoded "result", or raises PostcodeServiceUnavailable.
    """
    request = Request(
        f"{API_ROOT}{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        method="POST" if payload is not None else "GET",
    )
    try:
        with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            return json.load(response).get("result")
    except HTTPError as error:
        # 404 is a real answer ("no such postcode"), handled by the caller.
        if error.code == 404:
            return None
        raise PostcodeServiceUnavailable(f"postcodes.io answered {error.code}.") from error
    except (URLError, TimeoutError, ValueError, OSError) as error:
        raise PostcodeServiceUnavailable("postcodes.io could not be reached.") from error


def lookup(postcode):
    """
    One postcode to (latitude, longitude), or None when it does not exist.

    Raises PostcodeServiceUnavailable if postcodes.io itself is unreachable,
    which is a different thing from a postcode that is simply wrong: the
    caller tells the visitor a different story for each.
    """
    cleaned = normalise(postcode)
    if not looks_like_a_postcode(cleaned):
        return None

    result = _call(f"/postcodes/{quote(cleaned)}")
    return _point(result)


def lookup_terminated(postcode):
    """
    A postcode that has been RETIRED, as (latitude, longitude), or None.

    Royal Mail withdraws a postcode when the building it covered is rebuilt or
    renumbered, and postcodes.io then answers 404 for it on the ordinary
    endpoint while still holding the position it used to have.

    This matters here because the official provider register is retyped by
    hand once a year and carries a fair number of these: a college that moved
    or was rebuilt keeps its old postcode in the spreadsheet. Its position is
    still the right part of the country, so placing it there is far better
    than leaving it out of every search. The caller is expected to SAY it did
    this rather than quietly treat it as a clean lookup, because the address
    behind a retired postcode may well be stale.
    """
    cleaned = normalise(postcode)
    if not looks_like_a_postcode(cleaned):
        return None

    return _point(_call(f"/terminated_postcodes/{quote(cleaned)}"))


def lookup_many(postcodes):
    """
    Several postcodes at once: { normalised postcode: (lat, lon) or None }.

    Sent in batches of BULK_LIMIT, which is postcodes.io's own cap. Duplicates
    are collapsed first, so a hundred providers sharing a postcode cost one
    entry, not a hundred.
    """
    unique = sorted({normalise(postcode) for postcode in postcodes})
    found = {}

    for start in range(0, len(unique), BULK_LIMIT):
        batch = unique[start : start + BULK_LIMIT]
        results = _call("/postcodes", {"postcodes": batch}) or []
        for entry in results:
            found[normalise(entry.get("query", ""))] = _point(entry.get("result"))

    # Anything the service did not answer for is reported as not found, so the
    # caller never has to guess whether a key is missing or the value is None.
    return {postcode: found.get(postcode) for postcode in unique}


def _point(result):
    """Pull (latitude, longitude) out of one postcodes.io result, or None."""
    if not result:
        return None
    latitude, longitude = result.get("latitude"), result.get("longitude")
    if latitude is None or longitude is None:
        # Some real postcodes (a handful of new builds) have no position yet.
        logger.warning("postcodes.io has no position for %s.", result.get("postcode"))
        return None
    return latitude, longitude
