document.addEventListener("DOMContentLoaded", () => {
  const url1 = "https://classiccowl.chbk.run/jabama/listing";
  const url2 = "https://classiccowl.chbk.run/jabama/listing/order?order_id=";

  fetch(url1)
    .then((response) => response.json())
    .then((data) => {
      var ids = data["listing"];
      ids.push({ id: "2439453" });

      if (ids.length !== 0) {
        document.querySelector(".flat-button").style.display = "inline-block"
        ids.forEach((elm) =>
          fetch(url2 + elm["id"])
            .then((response2) => response2.json())
            .then((data2) => {
              const details = data2["details"];
              console.log(details);
              document.querySelector("#fname").innerHTML = details["firstname"];

              document.querySelector("#lname").innerHTML = details["lastname"];

              document.querySelector("#checkin").innerHTML = details["checkin"];
              document.querySelector("#checkout").innerHTML =
                details["checkout"];
              document.querySelector("#expire").innerHTML = details["expire"];
              document.querySelector("#nights").innerHTML = details["nights"];
              document.querySelector("#people").innerHTML = details["people"];
              document.querySelector("#payoutprice").innerHTML =
                details["payoutprice"];
              document.querySelector("#fullprice").innerHTML =
                details["fullprice"];
            })
        );
      } else {
        console.log("no id");
      }
    });
});
