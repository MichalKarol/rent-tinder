import React, { useContext, useState } from "react";
import { AuthenticationContext } from "../auth";
import { Carousel, Button } from "react-bootstrap";
import "./matches.css";
import { AnnotatedRentOffer } from "../types";
import { useAuthenticatedIO } from "../authenticated-io";

export function Matches() {
  const auth = useContext(AuthenticationContext);
  const { getMatches, changeReaction } = useAuthenticatedIO(auth.token);
  const [data, setData] = useState<
    null | "loading" | Array<AnnotatedRentOffer>
  >(null);

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

  // function vh(v: number) {
  //   var h = Math.max(
  //     document.documentElement.clientHeight,
  //     window.innerHeight || 0
  //   );
  //   return (v * h) / 100;
  // }

  // function vw(v: number) {
  //   var w = Math.max(
  //     document.documentElement.clientWidth,
  //     window.innerWidth || 0
  //   );
  //   return (v * w) / 100;
  // }

  // function vmin(v: number) {
  //   return Math.min(vh(v), vw(v));
  // }

  if (data === null) {
    getMatches().then((offers) => setData(offers));
    setData("loading");
  }

  if (!data) return null;

  return (
    <div className="matches">
      {data === "loading" ? (
        "Ładowanie"
      ) : (
        <>
          {data.length === 0
            ? "Brak matchy"
            : order(data).map((match, idx) => (
                <div className="matches-card" key={idx}>
                  <div className="matches-card-img">
                    <img src={`${match.image_urls[0]};s=128x128`} />
                  </div>
                  <div className="matches-card-title">
                    <a href={match.offer_id} target="_blank">
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
