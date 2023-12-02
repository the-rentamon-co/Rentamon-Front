// Target element class to observe
var targetClass = "flatpickr-calendar";

// Function to run when the target element is found
function onElementAvailable() {
  // Sample URLs for demonstration purposes
  const today = parseInt(document.querySelector(".today").textContent);
  const days = document.querySelectorAll(
    '.flatpickr-day:not([class*="prevMonthDay"]):not([class*="nextMonthDay"])'
  );

  const url1 =
    "https://classiccowl.chbk.run/jabama/calendar?room=109108&start_date=1402-9-1&end_date=1402-10-01";
  const url2 =
    "https://classiccowl.chbk.run/mizboon/calendar?rental_id=10922&from=1402-09-01&to=1402-09-30";
  const url3 =
    "https://classiccowl.chbk.run/otaghak/calendar?roomId=55614&startDate=1402-09-01&endDate=1402-09-30";
  const url4 = "https://classiccowl.chbk.run/jajiga/calendar?room_id=3142341";
  const url5 =
    "https://classiccowl.chbk.run/shab/calendar?room=9094&from_date=1402-09-01&to_date=1402-09-31";

  document.querySelector(".flatpickr-calendar").classList.add("open");
  // jabama status "available" / not
  // mizbon closed 0 / 1
  // otagak isBlocked true / false
  // jajiga disable_count 0 / 1
  // shab is_disabled ture / false

  // Array of URLs
  const urls = [url1, url2, url3, url4, url5];

  // Function to perform a fetch for a single URL
  const fetchData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  };

  // Array to store the promises returned by fetchData
  const fetchPromises = urls.map((url) => fetchData(url));

  // Use Promise.all to wait for all promises to resolve
  Promise.all(fetchPromises)
    .then((results) => {
      // Handle the results here

      // console.log(results[0][0]["status"])
      // console.log(results[1][0]["closed"])
      // console.log(results[2][0]["isBlocked"])
      // console.log(results[3][0]["disable_count"])
      // console.log(results[4][0]["status"])
      console.log(results);

      for (var i = 1; i < today; i++) {
        results[3].unshift({ disable_count: null });
      }

      for (let i = 0; i < 30; i++) {
        if (
          results[0][i]["status"] !== "available" &&
          results[1][i]["closed"] === 1 &&
          results[2][i]["isBlocked"] === true &&
          results[3][i]["disable_count"] === 1 &&
          results[4][i]["is_disabled"] === true
        ) {
          if (i + 1 < today) {
            days[i].style.background = "gray";
          } else {
            days[i].style.background = "red";
          }
        } else if (
          results[0][i]["status"] !== "available" ||
          results[1][i]["closed"] === 1 ||
          results[2][i]["isBlocked"] === true ||
          results[3][i]["disable_count"] === 1 ||
          results[4][i]["is_disabled"] === true
        ) {
          if (i + 1 < today) {
            days[i].style.background = "gray";
          } else {
            days[i].style.background = "orange";
          }
        }
      }
    })
    .catch((error) => {
      // Handle errors here
      console.error(error);
    });

  // Add your logic or functions here
}

// Create a MutationObserver with a callback function
var picker = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    // Check if the target class is present in the added nodes
    if (mutation.addedNodes) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var addedNode = mutation.addedNodes[i];
        if (addedNode.classList && addedNode.classList.contains(targetClass)) {
          // Call the function when the target element is found
          onElementAvailable();
          // Disconnect the observer since the task is done
          picker.disconnect();
          //   return;
        }
      }
    }
  });
});

// Options for the observer (we're interested in additions to the DOM)
var observerConfig = { childList: true, subtree: true };

// Start observing the target class
picker.observe(document.body, observerConfig);
