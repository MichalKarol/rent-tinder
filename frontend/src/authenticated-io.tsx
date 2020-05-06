import { useContext } from "react";
import { AuthenticationContext } from "./auth";
import { RentOffer, AnnotatedRentOffer } from "./types";

export function useAuthenticatedIO(token: string) {
  const authContext = useContext(AuthenticationContext);
  function logoutOnUnauthenticated(promise: Promise<any>) {
    return promise.catch((res) => {
      authContext.setToken("");
      window.location.href = "/";
    });
  }
  function getRentOffers(): Promise<Array<RentOffer>> {
    return logoutOnUnauthenticated(
      fetch("/api/rentoffers/", {
        method: "GET",
        headers: [["Authorization", `Token ${token}`]],
      })
        .then((res) => res.json())
        .then((res) => {
          return res.map((offer: any) => ({
            ...offer,
            image_urls: offer.image_urls.split("\t"),
          }));
        })
    );
  }

  function getMatches(): Promise<Array<AnnotatedRentOffer>> {
    return logoutOnUnauthenticated(
      fetch("/api/reactions/", {
        method: "GET",
        headers: [["Authorization", `Token ${token}`]],
      })
        .then((res) => res.json())
        .then((res) => {
          return res.map((offer: any) => ({
            ...offer,
            image_urls: offer.image_urls.split("\t"),
          }));
        })
    );
  }

  function sendReaction(rent_id: number, reaction: number) {
    return logoutOnUnauthenticated(
      fetch("/api/reactions/", {
        method: "POST",
        headers: [
          ["Content-Type", "application/json"],
          ["Authorization", `Token ${token}`],
        ],
        body: JSON.stringify({
          id: rent_id,
          reaction: reaction,
        }),
      })
    );
  }

  function changeReaction(rent_id: number, reaction: number) {
    return logoutOnUnauthenticated(
      fetch(`/api/reactions/${rent_id}/`, {
        method: "PATCH",
        headers: [
          ["Content-Type", "application/json"],
          ["Authorization", `Token ${token}`],
        ],
        body: JSON.stringify({
          id: rent_id,
          reaction: reaction,
        }),
      })
    );
  }

  return {
    getRentOffers,
    sendReaction,
    getMatches,
    changeReaction,
  };
}
