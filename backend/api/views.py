from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from rest_framework.authtoken.models import Token
from .serializers import RentOfferSerializer, AnnotatedReactionSerializer
from .models import RentOffer, Reaction
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_200_OK
from rest_framework.response import Response
from django.db.models import Exists, Max, Q, F


class NotSeenRentOffersViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RentOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_reactions = Reaction.objects.filter(
            user=self.request.user, reaction__in=[-1, 1]
        ).values("rent_id")
        return RentOffer.objects.exclude(id__in=user_reactions).all()


class ReactionsViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotatedReactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            RentOffer.objects.filter(reaction__user=self.request.user)
            .annotate(
                reaction_value=Max("reaction__reaction"), max_date=Max("reaction__date")
            )
            .all()
        )

    def create(self, request, *args, **kwargs):
        Reaction.objects.create(
            rent_id_id=int(request.data.get("id")),
            user=self.request.user,
            reaction=int(request.data.get("reaction")),
        )
        return Response(status=204)

    def partial_update(self, request, *args, **kwargs):
        reaction = Reaction.objects.filter(
            rent_id_id=int(request.data.get("id")), user=self.request.user
        ).first()
        if not reaction:
            return Response(status=404)
        reaction.reaction = int(request.data.get("reaction"))
        print(
            reaction.reaction,
            [
                print(vars(i))
                for i in Reaction.objects.filter(
                    rent_id_id=int(request.data.get("id")), user=self.request.user
                )
            ],
        )
        reaction.save()
        return Response(status=204)


@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def loginEndpoint(request):
    username = request.data.get("username")
    password = request.data.get("password")
    return login(request, username, password)


def login(request, username, password):
    if username is None or password is None:
        return Response(
            {"error": "Please provide both username and password"},
            status=HTTP_400_BAD_REQUEST,
        )
    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"error": "Invalid Credentials"}, status=HTTP_404_NOT_FOUND)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key}, status=HTTP_200_OK)


@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if username is None or password is None:
        return Response(
            {"error": "Please provide  username, password"}, status=HTTP_400_BAD_REQUEST
        )
    if User.objects.filter(username=username).first():
        return Response({"error": "User already exist"}, status=HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username, "empty@email.com", password)
    if not user:
        return Response(
            {"error": "Please provide better password"}, status=HTTP_400_BAD_REQUEST
        )
    return login(request, username, password)
