import React, { useContext, useState } from "react";
import { AuthenticationContext } from "../auth";
import { Button } from "react-bootstrap";
import "./matches.css";
import { AnnotatedRentOffer } from "../types";
import { useAuthenticatedIO } from "../authenticated-io";
import { FilteringContext } from "../filters";

export function Matches() {
  const auth = useContext(AuthenticationContext);
  const { filters: globalFilters } = useContext(FilteringContext);
  const { getMatches, changeReaction } = useAuthenticatedIO(auth.token);
  const [data, setData] = useState<
    null | "loading" | Array<AnnotatedRentOffer>
  >(null);
  const [filters, setFilters] = useState({ meh: true, eh: true, nice: true });

  function react(rent_id: number, reaction: number) {
    changeReaction(rent_id, reaction).then((res) => {
      setData((old_data) => {
        if (old_data && old_data !== "loading") {
          const newdata = [...old_data];
          const match = newdata.find((match) => match.id === rent_id);
          if (match) {
            match.reaction_value = reaction.toString();
          }
          return newdata;
        }
        return old_data;
      });
    });
  }

  function order(data: Array<AnnotatedRentOffer>) {
    return data.sort(
      (l, r) => Number(r.reaction_value) - Number(l.reaction_value)
    );
  }

  function filter(data: Array<AnnotatedRentOffer>) {
    return data.filter(
      (e) =>
        ((filters.meh && e.reaction_value === "-1") ||
          (filters.eh && e.reaction_value === "0") ||
          (filters.nice && e.reaction_value === "1")) &&
        (!globalFilters.minPrice || e.price >= globalFilters.minPrice) &&
        (!globalFilters.maxPrice || e.price <= globalFilters.maxPrice) &&
        (!globalFilters.minSize || e.size >= globalFilters.minSize) &&
        (!globalFilters.maxSize || e.size <= globalFilters.maxSize) &&
        (!globalFilters.minPricePerMeter ||
          e.price / e.size >= globalFilters.minPricePerMeter) &&
        (!globalFilters.maxPricePerMeter ||
          e.price / e.size >= globalFilters.maxPricePerMeter)
    );
  }

  if (data === null) {
    getMatches().then((offers) => setData(offers));
    setData("loading");
  }

  if (!data) return null;

  return (
    <div className="matches">
      <div className="matches-filters">
        Filtry:
        <div>
          <Button
            variant={filters.meh ? "danger" : "outline-danger"}
            onClick={() => setFilters((s) => ({ ...s, meh: !s.meh }))}
          >
            MEH
          </Button>
          <Button
            variant={filters.eh ? "light" : "outline-light"}
            onClick={() => setFilters((s) => ({ ...s, eh: !s.eh }))}
          >
            EH
          </Button>
          <Button
            variant={filters.nice ? "success" : "outline-success"}
            onClick={() => setFilters((s) => ({ ...s, nice: !s.nice }))}
          >
            NICE
          </Button>
        </div>
      </div>
      {data === "loading" ? (
        "Ładowanie"
      ) : (
        <>
          {data.length === 0
            ? "Brak matchy"
            : order(filter(data)).map((match, idx) => (
                <div className="matches-card" key={idx}>
                  <div className="matches-card-img">
                    <img
                      src={`${match.image_urls[0]};s=128x128`}
                      alt={match.title}
                    />
                  </div>
                  <div className="matches-card-title">
                    <a
                      href={match.offer_id}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {match.title}
                    </a>
                  </div>
                  <div className="matches-card-price">{match.price}</div>
                  <div className="matches-card-size">{match.size}</div>
                  <div className="matches-card-reactions">
                    <Button
                      variant={
                        match.reaction_value === "-1"
                          ? "danger"
                          : "outline-danger"
                      }
                      onClick={() => react(match.id, -1)}
                    >
                      MEH
                    </Button>
                    <Button
                      variant={
                        match.reaction_value === "0" ? "light" : "outline-light"
                      }
                      onClick={() => react(match.id, 0)}
                    >
                      EH
                    </Button>
                    <Button
                      variant={
                        match.reaction_value === "1"
                          ? "success"
                          : "outline-success"
                      }
                      onClick={() => react(match.id, 1)}
                    >
                      NICE
                    </Button>
                  </div>
                </div>
              ))}
        </>
      )}
    </div>
  );
}
