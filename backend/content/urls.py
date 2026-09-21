from rest_framework.routers import SimpleRouter

from .views import ContentItemViewSet, PathwayViewSet

router = SimpleRouter()
router.register("pathways", PathwayViewSet, basename="pathway")
router.register("content", ContentItemViewSet, basename="content")

urlpatterns = router.urls
