import React, { useContext, useState } from "react";
import { AuthenticationContext } from "../auth";
import { Carousel, Button, ProgressBar } from "react-bootstrap";
import "./offers.css";
import { RentOffer } from "../types";
import { useAuthenticatedIO } from "../authenticated-io";
import { FilteringContext } from "../filters";
import { Map as LMap, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

  const data = rawdata
    .filter(
      (e) =>
        (!globalFilters.minPrice || e.price >= globalFilters.minPrice) &&
        (!globalFilters.maxPrice || e.price <= globalFilters.maxPrice) &&
        (!globalFilters.minSize || e.size >= globalFilters.minSize) &&
        (!globalFilters.maxSize || e.size <= globalFilters.maxSize) &&
        (!globalFilters.minPricePerMeter ||
          e.price / e.size >= globalFilters.minPricePerMeter) &&
        (!globalFilters.maxPricePerMeter ||
          e.price / e.size >= globalFilters.maxPricePerMeter) &&
        (!globalFilters.blockingKeywords ||
          globalFilters.blockingKeywords.reduce(
            (acc: boolean, k: string) =>
              acc && !(e.description.includes(k) || e.title.includes(k)),
            true
          ))
    )
    .sort((a, b) => {
      function calculate(offer: RentOffer) {
        const positivePoints = globalFilters.positiveKeywords.reduce(
          (acc, k) =>
            offer.description.includes(k) || offer.title.includes(k)
              ? acc + 1
              : acc,
          0
        );
        const negativePoints = globalFilters.negativeKeywords.reduce(
          (acc, k) =>
            offer.description.includes(k) || offer.title.includes(k)
              ? acc + 1
              : acc,
          0
        );

        return positivePoints - negativePoints;
      }
      return -(calculate(a) - calculate(b));
    });

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
          <ProgressBar
            className="offer-progress"
            max={data.length - 1}
            now={index}
            label={`${index} / ${data.length - 1} (${(
              (index * 100) / data.length -
              1
            ).toFixed(2)}%)`}
          />
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

          {data[index].latitude && data[index].longitude && (
            <div className="offer-map-container">
              <LMap
                center={{
                  lat: data[index].latitude || 0,
                  lng: data[index].longitude || 0,
                }}
                zoom={14}
                id="mapid"
              >
                <TileLayer
                  url="https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
                  attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> 
                          © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> 
                          <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noreferer noopener">
                          Improve this map</a></strong>'
                  id="mapbox.light"
                  accessToken="pk.eyJ1IjoibWthcm9sIiwiYSI6ImNqazl4ODMxMDJ3OTEzd2xlbnN6OHRlMTgifQ.I_mm4Sc8fkKJaFpQc8BWjg"
                ></TileLayer>
                <Circle
                  center={{
                    lat: data[index].latitude || 0,
                    lng: data[index].longitude || 0,
                  }}
                  radius={10}
                />
              </LMap>
            </div>
          )}

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
