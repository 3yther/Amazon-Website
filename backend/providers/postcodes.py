"""The only file that calls postcodes.io (a free UK postcode lookup, no key needed).

Used by the geocode_providers command to place providers, and by the search
to find the visitor's postcode.
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

# Rough UK postcode shape, just to stop obvious rubbish being sent.
# postcodes.io decides if it really exists.
POSTCODE_PATTERN = re.compile(r"^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$")


class PostcodeServiceUnavailable(Exception):
    """postcodes.io could not be reached, or answered with something unusable."""


def normalise(postcode):
    """Upper case with no spaces, e.g. " sw1a 1aa " -> "SW1A1AA"."""
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
    """One postcode to (latitude, longitude), or None if it doesn't exist.
    Raises PostcodeServiceUnavailable if postcodes.io is down.
    """
    cleaned = normalise(postcode)
    if not looks_like_a_postcode(cleaned):
        return None

    result = _call(f"/postcodes/{quote(cleaned)}")
    return _point(result)


def lookup_many(postcodes):
    """Several postcodes at once, in batches of BULK_LIMIT. Duplicates are only looked up once."""
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
