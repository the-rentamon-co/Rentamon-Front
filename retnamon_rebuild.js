let apiHostMainUrl = "https://api-rentamon.liara.run";

url = {
  block: apiHostMainUrl + "/setblock/",
  unblock: apiHostMainUrl + "/setunblock/",
  calendar: apiHostMainUrl + "/getcalendar",
  price: apiHostMainUrl + "/setprice/",
  discount: apiHostMainUrl + "/setdiscount/",
}
// this is calendar config

// for changing max date change value in maxDate: new persianDate
$(window).on("load", function () {
  $(".inline").pDatepicker({
    initialValue: false,
    dayPicker: {
      enabled: true,
      titleFormat: "MMMM YYYY",
    },
    monthPicker: {
      enabled: false,
      titleFormat: "YYYY",
    },
    yearPicker: {
      enabled: false,
      titleFormat: "YYYY",
    },
    inline: true,
    minDate: new persianDate().startOf("day"),
    maxDate: new persianDate([1403, 4, 31]),
    // maxDate: new persianDate().add("years", 1).month(2).endOf("month"),
    // maxDate: new persianDate().
    // maxDate: new persianDate()
    //   .add("month", 3)
    //   .startOf("month")
    //   .subtract("day", 1),
    navigator: {
      enabled: true,
      scroll: {
        enabled: false,
      },
      text: {
        btnNextText: ">",
        btnPrevText: "<",
      },
    },
    format: "YYYY-MM-DD",
    resoinsive: true,
    template: `
      <div id="plotId" class="datepicker-plot-area datepicker-plot-area-inline-view">
      <div class="navigator">
      <div class="datepicker-header">
      <div class="btn btn-next pwt-btn pwt-btn-next">{{navigator.text.btnNextText}}</div>
      <div class="btn btn-switch pwt-btn pwt-btn-switch">{{ navigator.switch.text }}</div>
      <div class="btn btn-prev pwt-btn pwt-btn-prev">{{navigator.text.btnPrevText}}</div>
      </div>
      </div>
      <div class="datepicker-grid-view">
        {{#days.enabled}} {{#days.viewMode}}
        <div class="datepicker-day-view">
          <div class="month-grid-box">
            <div class="header">
              <div class="title"></div>
              <div class="header-row">
                <div class="header-row-cell">شنبه</div>
                <div class="header-row-cell">یک</div>
                <div class="header-row-cell">دو</div>
                <div class="header-row-cell">سه</div>
                <div class="header-row-cell">چهار</div>
                <div class="header-row-cell">پنج</div>
                <div class="header-row-cell">جمعه</div>
              </div>
            </div>
            <table cellspacing="1" class="table-days">
              <tbody>
                {{#days.list}}
                <tr>
                  {{#.}} {{#enabled}}
                  <td data-unix="{{dataUnix}}" class="{{#selected}}selected{{/selected}}">
                    <span
                      class="{{#otherMonth}}other-month{{/otherMonth}}"
                      >{{title}}</span
                    ><span class="reserved"></span><span class="price"></span>
                  </td>
                  {{/enabled}} {{^enabled}}
                  <td data-unix="{{dataUnix}}" class="disabled">
                    <span class="{{#otherMonth}}other-month{{/otherMonth}}"
                      >{{title}}</span
                    ><span
                      class="reserved {{#otherMonth}}other-month{{/otherMonth}}"
                    ></span><span class="price {{#otherMonth}}other-month{{/otherMonth}}"></span>
                  </td>
                  {{/enabled}} {{/.}}
                </tr>
                {{/days.list}}
              </tbody>
            </table>
          </div>
        </div>
        {{/days.viewMode}} {{/days.enabled}}
      </div>
    </div>
    `,
  });
  try {
    document
      .querySelectorAll(".elementor-widget-wrap.elementor-element-populated")
      .forEach((a) => {
        var aa = a.querySelector(".elementor-element");

        if (aa.getAttribute("data-widget_type") === "html.default") {
          var b = aa.querySelector(".elementor-widget-container");

          if (b.querySelector(".inline")) {
            a.style.padding = 0;
          }
        }
      });
  } catch (error) {
    console.log("padding gone");
  }
});

async function rentamoning() {
  // Remove the event listener from all forms to prevent multiple submissions
  document.addEventListener('DOMContentLoaded', checkAuthOnLoad)
  document.querySelectorAll("form").forEach(form => {
    form.removeEventListener("submit", rentamoning);
  });

  // Display the loading overlay
  document.querySelector(".loading-overlay-calendar").style.display = "flex";

  // Reset all inputs with the name "block"
  document.querySelectorAll('input[name="block"]').forEach(input => {
    input.checked = false;
  });

  // Get all available days in the datepicker
  const availableDays = Array.from(
    document.querySelectorAll(".datepicker-day-view td:not(.disabled)")
  ).filter(td => {
    const isOtherMonth = td.firstElementChild.classList.contains("other-month");
    if (isOtherMonth) {
      td.classList.add("other-month");
      return false;
    }
    return true;
  });

  // If there are available days, generate the date range
  if (availableDays.length > 0) {
    const firstDayUnix = parseInt(availableDays[0].getAttribute("data-unix"));
    const lastDayUnix = parseInt(availableDays[availableDays.length - 1].getAttribute("data-unix"));

    const range = [
      new persianDate(firstDayUnix).format("YYYY-MM-DD"),
      new persianDate(lastDayUnix).format("YYYY-MM-DD"),
      new persianDate(lastDayUnix).add("day", 1).format("YYYY-MM-DD")
    ];
  }
}



// this function ckecks witch action btn is ckecked
function checkAction() {
  let action = document.querySelector('input[name="block"]:checked');
  if (action) {
    if (action.value === "block") {
      blockBtnClicked();
    } else if (action.value === "reserve") {
      reserveOther();
    } else if (action.value === "unblock") {
      unblockBtnClicked();
    }
  } else {
    // alert(messages.notSelectedDay);
  }
}

function priceBtnClicked() {
  let selected = document.querySelectorAll(".selected");
  if (selected.length > 0) {
    var price_div = document.createElement("div");
    price_div.style.display = "none";
    price_div.className = "price-submit";
    document.body.appendChild(price_div);
    price_div.click();
  } else {
    alert(messages.notSelectedDay);
  }
}


// this function is called when block option is selected
// if there are selected days, it starts requesting for block to each website
async function blockBtnClicked() {
  document.querySelector(".loading-overlay-calendar").style.display = "flex";

  console.log(JSON.stringify(regweb));
  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
    });
    var response_status = document.querySelector(".response_status");
    if (response_status) {
      document.querySelector(".response_status_pop a").click();
    }
    const apicalls = [];

    
    if(regWebsites.includes('otaghak')){
      apicalls.push(rentamonApiCaller(
        (website = "otaghak"),
        (data = {
          rentamon_room_id: routes["otaghak"]["room"],
          unblockDays: null,
          blockDays: selectedDate.join(","),
        }),
        (action = "block")
      ))
    }
    
    const resps = await Promise.all(apicalls);
    await rentamoning();
  } else {
    alert(messages.notSelectedDay);
    document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}

// this function is called when unblock option is selected
// if there are selected days, it starts requesting for unblock to each website
async function unblockBtnClicked() {

  document.querySelector(".loading-overlay-calendar").style.display = "flex";
  let selected = document.querySelectorAll(".selected");
  let selectedDate = [];
  if (selected.length > 0) {
    selected.forEach((z) => {
      z.classList.remove("selected");
      selectedDate.push(
        new persianDate(parseInt(z.getAttribute("data-unix"))).format(
          "YYYY-MM-DD"
        )
      );
    });
    var response_status = document.querySelector(".response_status");

    if (response_status) {
      document.querySelector(".response_status_pop a").click();
    }
    // adding api calls if user has registered in the website
    const apicalls = [
      rentamonApiCaller(
        (website = "otherv2"),
        (data = {
          action: "available",
          rentamon_room_id: routes["otherv2"]["room"],
          days: selectedDate.join(","),
        }),
        (action = "blockUnblock")
      ),
    ]

    if(regWebsites.includes('otaghak')){
      apicalls.push(rentamonApiCaller(
        (website = "otaghak"),
        (data = {
          rentamon_room_id: routes["otaghak"]["room"],
          unblockDays: selectedDate.join(","),
          blockDays: null,
        }),
        (action = "unblock")
      ))
    }

    console.log(regweb);
    const resps = await Promise.all(apicalls);
    await rentamoning();
  } else {
    alert(messages.notSelectedDay);
    document.querySelector(".loading-overlay-calendar").style.display = "none";
  }
}

async function checkAuthOnLoad() {
  const accessToken = getCookie('auth_token');
  const refreshToken = getCookie('refresh_token');

  if (!accessToken || !refreshToken) {
    return false;
  }

  const isAccessTokenValid = await verifyToken(accessToken, 'access');
  if (!isAccessTokenValid) {
    const isRefreshTokenValid = await verifyToken(refreshToken, 'refresh');
    if (!isRefreshTokenValid) {
      return false;
    } else {
      return false // TODO : adding the refresh token handler 
    }
  }else{
    return true
  }
}