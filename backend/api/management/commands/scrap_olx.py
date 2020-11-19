from django.core.management.base import BaseCommand, CommandError
import requests
from bs4 import BeautifulSoup
from api.models import RentOffer


SCRAP_URLS = [
    "https://www.olx.pl/nieruchomosci/dolnoslaskie/q-wynajem-pok%C3%B3j/?search%5Bfilter_float_price%3Ato%5D=600&search%5Bdescription%5D=1&search%5Border%5D=created_at%3Adesc",
]


def scrapDetails(url):
    print(url)

    def strip_size(img_url: str):
        size_index = img_url.find(";s=")
        return img_url[:size_index]

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    title = soup.select(".offer-titlebox h1")[0].get_text().strip()
    images = [strip_size(img.get("src")) for img in soup.select("img.vmiddle")]
    price = float(
        soup.select("strong.pricelabel__value")[0].get_text().replace(" ", "").replace(",", ".")[:-2]
    )
    details = soup.select(".offer-details")[0]
    cells = details.select(".offer-details__name")
    rent_th = next(
        (cell for cell in cells if cell.get_text() == "Czynsz (dodatkowo)"), None
    )
    rent = (
        0
        if rent_th is None
        else float(
            rent_th.next_sibling.next_sibling.get_text()
            .strip()
            .replace(",", ".")
            .replace(" ", "")[:-2]
        )
    )

    size_th = next((cell for cell in cells if cell.get_text() == "Powierzchnia"), None)
    size = (
        0
        if size_th is None
        else float(
            size_th.next_sibling.next_sibling.get_text()
            .strip()
            .replace(",", ".")
            .replace(" ", "")[:-2]
        )
    )
    description = soup.find(id="textContent").get_text().strip()
    return (title, images, price + rent, size, description)


class Command(BaseCommand):
    def handle(self, *args, **options):
        def strip_promoted(details_url: str):
            promoted_index = details_url.find("#")
            return details_url if promoted_index < 0 else details_url[:promoted_index]

        for url in SCRAP_URLS:
            page = 1
            while page < 10:
                response = requests.get(f"{url}&page={page}")
                if "q-" not in response.url:
                    break
                soup = BeautifulSoup(response.text, "html.parser")
                details = soup.select("table.offers a.detailsLink") + soup.select(
                    "table.offers a.detailsLinkPromoted"
                )
                detailsUrls = set(
                    strip_promoted(link.get("href"))
                    for link in details
                    if "olx.pl" in link.get("href")
                )
                for detailsUrl in detailsUrls:
                    if not RentOffer.objects.filter(offer_id=detailsUrl).exists():
                        title, images, price, size, description = scrapDetails(
                            detailsUrl
                        )
                        RentOffer.objects.create(
                            offer_id=detailsUrl,
                            source="OLX",
                            title=title,
                            image_urls="\t".join(images),
                            description=description,
                            price=price,
                            size=size,
                        )
                page = page + 1
