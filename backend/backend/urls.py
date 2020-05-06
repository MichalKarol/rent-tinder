from django.contrib import admin
from django.urls import path, include
from api.urls import urlpatterns as ApiUrls

urlpatterns = [
    path("admin/", admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    *ApiUrls,
]