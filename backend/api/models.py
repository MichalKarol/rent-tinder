from django.db import models
from django.contrib.auth.models import User


class RentOffer(models.Model):
    offer_id = models.TextField()
    source = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    image_urls = models.TextField()
    description = models.TextField()
    price = models.IntegerField()
    size = models.IntegerField()


class Reaction(models.Model):
    rent_id = models.ForeignKey(RentOffer, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.IntegerField()
    date = models.DateTimeField(auto_now=True)
