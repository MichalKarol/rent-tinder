from django.core.management.base import BaseCommand, CommandError
import requests
from bs4 import BeautifulSoup
from api.models import RentOffer
import json

SCRAP_URLS = [
    "https://www.otodom.pl/wynajem/pokoj/dolnoslaskie/?search%5Bfilter_float_price%3Ato%5D=600&search%5Border%5D=created_at_first%3Adesc&search%5Bregion_id%5D=1&nrAdsPerPage=72",
]


def scrapDetails(url):
    print(url)

    def strip_size(img_url: str):
        size_index = img_url.find(";s=")
        return img_url[:size_index]

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    state_json = soup.find(id="server-app-state").contents[0]
    state_dict = json.loads(state_json)
    props = state_dict["initialProps"]
    data = props['data']['advert']

    title = data['title']
    images = {
        strip_size(img['small']) for img in data['photos']
    }
    price = float(data['price']['value'])
    rent_th = next((cell for cell in data['characteristics'] if cell['key'] == 'rent'), None)
    rent = (0 if rent_th is None else float(rent_th['value']))
    size_th = next((cell for cell in data['characteristics'] if cell['key'] == 'm'), None)
    size = (0 if size_th is None else float(size_th['value']))
    description = BeautifulSoup(data['description'], "html.parser").get_text().strip()
    latitude = data['location']['coordinates']['latitude']
    longitude = data['location']['coordinates']['longitude']
    print(price, rent, type(price), type(rent))
    return (title, images, price + rent, size, description, latitude, longitude)


class Command(BaseCommand):
    def handle(self, *args, **options):
        def strip_promoted(details_url: str):
            promoted_index = details_url.find("#")
            return details_url if promoted_index < 0 else details_url[:promoted_index]

        for url in SCRAP_URLS:
            page = 1
            while page < 15:
                response = requests.get(f"{url}&page={page}")
                soup = BeautifulSoup(response.text, "html.parser")
                details = soup.select(".offer-item-header h3 a")
                detailsUrls = set(
                    strip_promoted(link.get("href"))
                    for link in details
                    if "otodom.pl" in link.get("href")
                )
                added = 0
                for detailsUrl in detailsUrls:
                    if not RentOffer.objects.filter(offer_id=detailsUrl).exists():
                        title, images, price, size, description, latitude, longitude = scrapDetails(
                            detailsUrl
                        )
                        RentOffer.objects.create(
                            offer_id=detailsUrl,
                            source="OTODOM",
                            title=title,
                            image_urls="\t".join(images),
                            description=description,
                            price=price,
                            size=size,
                            latitude=latitude,
                            longitude=longitude
                        )
                        added = added + 1
                if added == 0:
                    break
                page = page + 1
