"""
How far apart two points on the Earth are, in miles.

Kept in its own file so it can be tested on its own, with no database and no
network. Plain Python is fast enough here: we hold a few hundred providers at
most, and measuring all of them takes well under a millisecond.
"""
from math import asin, cos, radians, sin, sqrt

# Mean radius of the Earth. The haversine formula treats the planet as a
# sphere, which is accurate to about 0.3% for distances at this scale: good
# enough for "colleges near me", and we round to one decimal place anyway.
EARTH_RADIUS_MILES = 3958.7613


def haversine_miles(lat1, lon1, lat2, lon2):
    """
    The great-circle distance between two latitude/longitude points, in miles.

    NEW CONCEPT: the haversine formula. Straight-line distance does not work
    on a sphere, so this measures along the surface instead. Accepts floats or
    Decimals (the model stores Decimals), because math.radians takes either.
    """
    lat1, lon1, lat2, lon2 = (radians(float(value)) for value in (lat1, lon1, lat2, lon2))
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    a = sin(delta_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2
    return 2 * EARTH_RADIUS_MILES * asin(sqrt(a))
