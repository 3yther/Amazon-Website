"""How far apart two points are, in miles. In its own file so it's easy to test."""
from math import asin, cos, radians, sin, sqrt

# Average radius of the Earth. Treating it as a sphere is close enough here.
EARTH_RADIUS_MILES = 3958.7613


def haversine_miles(lat1, lon1, lat2, lon2):
    """Distance between two latitude/longitude points in miles (haversine formula).
    Works with floats or Decimals.
    """
    lat1, lon1, lat2, lon2 = (radians(float(value)) for value in (lat1, lon1, lat2, lon2))
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    a = sin(delta_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2
    return 2 * EARTH_RADIUS_MILES * asin(sqrt(a))
