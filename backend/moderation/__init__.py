"""
The one place the site decides whether a piece of writing is appropriate.

Not a Django app: no models, no migrations, nothing in INSTALLED_APPS. It is a
plain package because four apps share it (accounts, community, interest and
the feedback form) and it does not belong inside any one of them.

Not to be confused with community/moderation.py, which is a different job: that
one stops a Community post for sharing personal details, linking off-site, or
sounding like someone at risk. This one only answers "is the language itself
appropriate", and it is used well beyond the Community.
"""

from .appropriateness import INAPPROPRIATE_MESSAGE, check_appropriate

__all__ = ["check_appropriate", "INAPPROPRIATE_MESSAGE"]
