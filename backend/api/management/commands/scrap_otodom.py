from django.core.management.base import BaseCommand, CommandError
import requests
from bs4 import BeautifulSoup
from api.models import RentOffer


SCRAP_URLS = [
    "https://www.otodom.pl/wynajem/mieszkanie/wroclaw/?search[region_id]=1&search[subregion_id]=381&search[city_id]=39&search[order]=created_at_first%3Adesc&nrAdsPerPage=72",
]


def scrapDetails(url):
    print(url)

    def strip_size(img_url: str):
        size_index = img_url.find(";s=")
        return img_url[:size_index]

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    title = soup.select("h1")[0].get_text().strip()
    images = {
        strip_size(img.get("src")) for img in soup.select("figure.thumbsItem img")
    }
    price = int(
        next(soup.select(".css-1vr19r7")[0].children).string.replace(" ", "")[:-2]
    )
    cells = soup.select(".css-1ci0qpi li")
    rent_th = next(
        (cell for cell in cells if "Czynsz - dodatkowo" in cell.get_text()), None
    )
    rent = (
        0
        if rent_th is None
        else float(
            rent_th.select("strong")[0]
            .get_text()
            .strip()
            .replace(",", ".")
            .replace(" ", "")[:-2]
        )
    )

    size_th = next((cell for cell in cells if "Powierzchnia" in cell.get_text()), None)
    size = (
        0
        if size_th is None
        else float(
            size_th.select("strong")[0]
            .get_text()
            .strip()
            .replace(",", ".")
            .replace(" ", "")[:-2]
        )
    )
    description = soup.select(".css-1bi3ib9")[0].get_text().strip()
    return (title, images, price + rent, size, description)


class Command(BaseCommand):
    def handle(self, *args, **options):
        def strip_promoted(details_url: str):
            promoted_index = details_url.find("#")
            return details_url if promoted_index < 0 else details_url[:promoted_index]

        for url in SCRAP_URLS:
            page = 1
            while page < 50:
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
                        title, images, price, size, description = scrapDetails(
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
                        )
                        added = added + 1
                if added == 0:
                    break
                page = page + 1
