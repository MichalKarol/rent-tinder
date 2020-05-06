from django.conf.urls import url, include
from django.urls import path
from rest_framework import routers, serializers, viewsets
from .views import loginEndpoint, register, NotSeenRentOffersViewSet, ReactionsViewSet

router = routers.DefaultRouter()
router.register(
    r"^api/rentoffers", NotSeenRentOffersViewSet, basename="NotSeenRentOffersViewSet"
)
router.register(r"^api/reactions", ReactionsViewSet, basename="ReactionsViewSet")

urlpatterns = [
    url(r"^", include(router.urls)),
    path("api/login", loginEndpoint),
    path("api/register", register),
]
