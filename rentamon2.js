document.addEventListener("DOMContentLoaded", () => {
  let apiDomainUrl = "https://rentamon.chbk.run";
  let listings = [
    apiDomainUrl +
      "/jabama/listing" +
      `?rentamon_room_id=${routes.jabama.room}&rentamon_id=${rentamon_user_id}`,
    apiDomainUrl +
      "/jajiga/listing" +
      `?rentamon_room_id=${routes.jajiga.room}&rentamon_id=${rentamon_user_id}`,
    apiDomainUrl +
      "/mizboon/listing" +
      `?rentamon_room_id=${routes.mizboon.room}&rentamon_id=${rentamon_user_id}`,
    apiDomainUrl +
      "/shab/listing" +
      `?rentamon_room_id=${routes.shab.room}&rentamon_id=${rentamon_user_id}`,
    apiDomainUrl +
      "/otaghak/listing" +
      `?rentamon_room_id=${routes.otaghak.room}&rentamon_id=${rentamon_user_id}`,

    apiDomainUrl +
      "/mihmansho/listing" +
      `?rentamon_room_id=${routes.mihmansho.room}&rentamon_id=${rentamon_user_id}`,
  ];
  let fetchDataForListing = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  };

  let fetchPromisesForListing = listings.map((url) => fetchDataForListing(url));

  Promise.all(fetchPromisesForListing).then((results) => {
    results.forEach((site) => {
      let ids = site["listing"];
      if (typeof x !== "undefined" && ids.length !== 0) {
        document.querySelector(".flat-button").style.display = "inline-block";

        for (let elm = 0; elm < ids.length; elm++) {
          fetch(
            apiDomainUrl +
              site["forDetail"][elm] +
              `&rentamon_id=${rentamon_user_id}`
          )
            .then((response2) => response2.json())
            .then((data2) => {
              const details = data2["details"];
              console.log(details);
              document.querySelector("#website-title").innerHTML =
                details["website"];
              document.querySelector("#fname").innerHTML = details["firstname"];
              document.querySelector("#lname").innerHTML = details["lastname"];
              document.querySelector("#checkin").innerHTML = details["checkin"];
              document.querySelector("#checkout").innerHTML =
                details["checkout"];
              document.querySelector("#expire").innerHTML = details["expire"];
              document.querySelector("#nights").innerHTML = details["nights"];
              document.querySelector("#people").innerHTML = details["people"];
              document.querySelector("#payoutprice").innerHTML = (
                parseInt(details["payoutprice"]) / 10
              )
                .toLocaleString()
                .replace(/,/g, "/");
              document.querySelector("#fullprice").innerHTML = (
                parseInt(details["fullprice"]) / 10
              )
                .toLocaleString()
                .replace(/,/g, "/");

              document
                .querySelector("#acceptrequest")
                .addEventListener("click", () =>
                  fetch(
                    apiDomainUrl +
                      data2["forAccept"] +
                      `&rentamon_id=${rentamon_user_id}`
                  )
                    .then((r) => r.json())
                    .then((d) => console.log(d))
                );

              document
                .querySelector("#declinerequest")
                .addEventListener("click", () =>
                  fetch(
                    apiDomainUrl +
                      data2["forReject"] +
                      `&rentamon_id=${rentamon_user_id}`
                  )
                    .then((r) => r.json())
                    .then((d) => console.log(d))
                );
            });
        }
      }
    });
  });
});
