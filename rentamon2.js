document.addEventListener("DOMContentLoaded", () => {
  const listings = [
    "https://classiccowl.chbk.run/jabama/listing",
    "https://classiccowl.chbk.run/jajiga/listing",
    "https://classiccowl.chbk.run/mizboon/listing",
    "https://classiccowl.chbk.run/shab/listing",
    "https://classiccowl.chbk.run/otaghak/listing",
  ];
  const fetchDataForListing = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  };

  const apiDomainUrl = "https://classiccowl.chbk.run";

  const fetchPromisesForListing = listings.map((url) =>
    fetchDataForListing(url)
  );

  Promise.all(fetchPromisesForListing).then((results) => {
    results.forEach((site) => {
      var ids = site["listing"];
      if (ids.length !== 0) {
        document.querySelector(".flat-button").style.display = "inline-block";

        for (let elm = 0; elm < ids.length; elm++) {
          fetch(apiDomainUrl + site["forDetail"][elm])
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
              document.querySelector("#payoutprice").innerHTML =
                parseInt(details["payoutprice"])/10;
              document.querySelector("#fullprice").innerHTML =
                parseInt(details["fullprice"])/10;

              document
                .querySelector("#acceptrequest")
                .addEventListener("click", () =>
                  fetch(apiDomainUrl + data2["forAccept"])
                    .then((r) => r.json())
                    .then((d) => console.log(d))
                );

              document
                .querySelector("#declinerequest")
                .addEventListener("click", () =>
                  fetch(apiDomainUrl + data2["forReject"])
                    .then((r) => r.json())
                    .then((d) => console.log(d))
                );
            });
        }
      }
    });
  });
});
// );
//       }
//       // ids.forEach((elm) => {
//       //   fetch( apiDomainUrl + )
//       //     .then((response2) => response2.json())
//       //     .then((data2) =>

//       console.log("yyya");
//       console.log(site["forDetail"]);
//     }
//   });
// });

// fetch(url1)
//   .then((response) => response.json())
//   .then((data) => {
//     var ids = data["listing"];
//     // ids.push({ id: "2439453" });

//     if (ids.length !== 0) {
//       document.querySelector(".flat-button").style.display = "inline-block";
//       ids.forEach((elm) => {
//         fetch(url2 + elm["id"])
//           .then((response2) => response2.json())
//           .then((data2) => {
//             const details = data2["details"];
//             console.log(details);
//             document.querySelector("#website-title").innerHTML =
//               details["website"];
//             document.querySelector("#fname").innerHTML = details["firstname"];
//             document.querySelector("#lname").innerHTML = details["lastname"];
//             document.querySelector("#checkin").innerHTML = details["checkin"];
//             document.querySelector("#checkout").innerHTML =
//               details["checkout"];
//             document.querySelector("#expire").innerHTML = details["expire"];
//             document.querySelector("#nights").innerHTML = details["nights"];
//             document.querySelector("#people").innerHTML = details["people"];
//             document.querySelector("#payoutprice").innerHTML =
//               details["payoutprice"];
//             document.querySelector("#fullprice").innerHTML =
//               details["fullprice"];

//             document
//               .querySelector("#acceptrequest")
//               .addEventListener("click", () =>
//                 fetch("https://classiccowl.chbk.run" + data2["forAccept"])
//                   .then((r) => r.json())
//                   .then((d) => console.log(d))
//               );

//             document
//               .querySelector("#declinerequest")
//               .addEventListener("click", () =>
//                 fetch("https://classiccowl.chbk.run" + data2["forReject"])
//                   .then((r) => r.json())
//                   .then((d) => console.log(d))
//               );
//           });
//       });
//     } else {
//       console.log("no id");
//     }
//   });
// });
