from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import RentOffer, Reaction


class RentOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentOffer
        fields = [
            "id",
            "offer_id",
            "source",
            "title",
            "image_urls",
            "description",
            "price",
            "size",
            "latitude",
            "longitude"
        ]


class AnnotatedReactionSerializer(serializers.ModelSerializer):
    reaction_value = serializers.CharField()

    class Meta:
        model = RentOffer
        fields = [
            "id",
            "offer_id",
            "source",
            "title",
            "image_urls",
            "description",
            "price",
            "size",
            "reaction_value",
        ]
