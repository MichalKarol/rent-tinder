import React, { useContext, useState } from "react";
import { AuthenticationContext } from "../auth";
import { Carousel, Button } from "react-bootstrap";
import "./offers.css";
import { RentOffer } from "../types";
import { useAuthenticatedIO } from "../authenticated-io";
import { FilteringContext } from "../filters";

export function Offers() {
  const auth = useContext(AuthenticationContext);
  const { filters: globalFilters } = useContext(FilteringContext);
  const { getRentOffers, sendReaction } = useAuthenticatedIO(auth.token);
  const [rawdata, setRawData] = useState<null | "loading" | Array<RentOffer>>(
    null
  );
  const [index, setIndex] = useState<number>(0);
  const [photoIndex, setPhotoIndex] = useState<number>(0);

  function react(rent_id: number, reaction: number) {
    sendReaction(rent_id, reaction).then((res) => {
      setIndex(index + 1);
      setPhotoIndex(0);
    });
  }

  function vh(v: number) {
    var h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    return (v * h) / 100;
  }

  function vw(v: number) {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    return (v * w) / 100;
  }

  function vmin(v: number) {
    return Math.min(vh(v), vw(v));
  }

  if (rawdata === null) {
    getRentOffers().then((offers) => setRawData(offers));
    setRawData("loading");
  }

  if (!rawdata) return null;
  if (rawdata === "loading") return <div className="offers">Ładowanie</div>;

  const data = rawdata.filter(
    (e) =>
      (!globalFilters.minPrice || e.price >= globalFilters.minPrice) &&
      (!globalFilters.maxPrice || e.price <= globalFilters.maxPrice) &&
      (!globalFilters.minSize || e.size >= globalFilters.minSize) &&
      (!globalFilters.maxSize || e.size <= globalFilters.maxSize) &&
      (!globalFilters.minPricePerMeter ||
        e.price / e.size >= globalFilters.minPricePerMeter) &&
      (!globalFilters.maxPricePerMeter ||
        e.price / e.size >= globalFilters.maxPricePerMeter)
  );

  return (
    <div className="offers">
      {data.length <= index ? (
        "Brak ofert"
      ) : (
        <>
          <Carousel
            className="offer-images"
            activeIndex={photoIndex}
            onSelect={(idx: number) => setPhotoIndex(idx)}
          >
            {data[index].image_urls.map((img, idx) => (
              <Carousel.Item key={idx}>
                <div className="offer-imagediv">
                  <img
                    className="offer-image"
                    src={`${img};s=${vmin(60).toFixed(0)}x${vmin(60).toFixed(
                      0
                    )};q=80`}
                    alt={data[index].title}
                  />
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
          <div className="offer-details">
            <div style={{ gridArea: "title" }}>
              <a
                href={data[index].offer_id}
                target="_blank"
                rel="noopener noreferrer"
              >
                {data[index].title}
              </a>
            </div>
            <div style={{ gridArea: "price" }}>{data[index].price} zł</div>
            <div style={{ gridArea: "size" }}>{data[index].size} m2</div>
          </div>

          <div className="offer-description">{data[index].description}</div>
          <div className="offer-footer">
            <Button
              variant="outline-danger"
              onClick={() => react(data[index].id, -1)}
            >
              MEH
            </Button>
            <Button
              variant="outline-light"
              onClick={() => react(data[index].id, 0)}
            >
              EH
            </Button>
            <Button
              variant="outline-success"
              onClick={() => react(data[index].id, 1)}
            >
              NICE
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
