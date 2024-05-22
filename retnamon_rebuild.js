let apiHostMainUrl = "https://api-rentamon.liara.run";

url = {
  block: apiHostMainUrl + "/setblock/",
  unblock: apiHostMainUrl + "/setunblock/",
  calendar: apiHostMainUrl + "/getcalendar",
  price: apiHostMainUrl + "/setprice/",
  discount: apiHostMainUrl + "/setdiscount/",
}

// this is the main function that fetches data from websites based on calendar
async function rentamoning() {
  document
    .querySelectorAll("form")
    .forEach((form) => form.removeEventListener("submit", rentamoning));

  // starts loading when this function is called
  // document.querySelector(".loading-overlay-calendar").style.display = "flex";

  // resets every action input
  document
    .querySelectorAll('input[name="block"]')
    .forEach((i) => (i.checked = false));
  var availableDays = [];

  // selecting start and end of each days range
  var allTds = document.querySelectorAll(
    ".datepicker-day-view td:not(.disabled)"
  );
  allTds.forEach((td) => {
    if (!td.firstElementChild.classList.contains("other-month")) {
      availableDays.push(td);
    } else {
      td.classList.add("other-month");
    }
  });
  if (availableDays.length > 0) {
    var days = document.querySelectorAll(
      ".datepicker-plot-area-inline-view .table-days td:not(.disabled) span:not(.other-month):not(.reserved):not(.price)"
    );
    var range = [
      new persianDate(
        parseInt(availableDays[0].getAttribute("data-unix"))
      ).format("YYYY-MM-DD"),
      new persianDate(
        parseInt(
          availableDays[availableDays.length - 1].getAttribute("data-unix")
        )
      ).format("YYYY-MM-DD"),
      new persianDate(
        parseInt(
          availableDays[availableDays.length - 1].getAttribute("data-unix")
        )
      )
        .add("day", 1)
        .format("YYYY-MM-DD"),
    ];
    
    
    availableDays.forEach((day) => {
      day.removeEventListener("click", handleDayClick);
      day.addEventListener("click", handleDayClick);
    });
  } else {
    document.querySelector(".loading-overlay-calendar").style.display = "none";
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

    
    
    console.log('GOT HERE');
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


$(document).ready(function () {
  const webdisconnectedJabamaBtn = document.querySelector("#webdisconnected");
  const webdisconnectedOtaghakBtn = document.querySelector(
    "#webdisconnected_otaghak"
  );
  const webdisconnectedJajigaBtn = document.querySelector(
    "#webdisconnected_jajiga"
  );
  const webdisconnectedShabBtn = document.querySelector(
    "#webdisconnected_shab"
  );
  const webdisconnectedMihmanshoBtn = document.querySelector(
    "#webdisconnected_mihmansho"
  );
  const webdisconnectedHomsaBtn = document.querySelector(
    "#webdisconnected_homsa"
  );
  const webdisconnectedMizboonBtn = document.querySelector(
    "#webdisconnected_mizboon"
  );

  if (webdisconnectedMizboonBtn !== null) {
    webdisconnectedMizboonBtn.addEventListener("click", disconnectedBtnClicked);
  }
  if (webdisconnectedHomsaBtn !== null) {
    webdisconnectedHomsaBtn.addEventListener("click", disconnectedBtnClicked);
  }

  if (webdisconnectedMihmanshoBtn !== null) {
    webdisconnectedMihmanshoBtn.addEventListener(
      "click",
      disconnectedBtnClicked
    );
  }

  if (webdisconnectedJabamaBtn !== null) {
    webdisconnectedJabamaBtn.addEventListener("click", disconnectedBtnClicked);
  }

  if (webdisconnectedOtaghakBtn !== null) {
    webdisconnectedOtaghakBtn.addEventListener("click", disconnectedBtnClicked);
  }
  if (webdisconnectedJajigaBtn !== null) {
    webdisconnectedJajigaBtn.addEventListener("click", disconnectedBtnClicked);
  }
  if (webdisconnectedShabBtn !== null) {
    webdisconnectedShabBtn.addEventListener("click", disconnectedBtnClicked);
  }

  // price
  // this mutationobserver handels price pop up
  const priceTargetElementId = "elementor-popup-modal-7426";
  const priceObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const addedNodes = Array.from(mutation.addedNodes);
        const targetElement = addedNodes.find(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            node.id.includes(priceTargetElementId)
        );
        if (targetElement) {
          let selected = document.querySelectorAll(".selected");
          let selectedDate = [];
          selected.forEach((z) => {
            z.classList.remove("selected");
            selectedDate.push(
              new persianDate(parseInt(z.getAttribute("data-unix"))).format(
                "YYYY-MM-DD"
              )
            );
          });
          document.querySelector('input[name="form_fields[dates]"').value =
            selectedDate;
          document.querySelector('input[name="form_fields[h_f_r_i]"').value =
            rentamon_user_id;
          document.querySelector('input[name="form_fields[h_f_r_r_i]"').value =
            rentamon_room_id;
        }
      }
    }
  });

  priceObserver.observe(document.body, { childList: true, subtree: true });

  //

  // discount
  // this mutationobserver handels discount pop up
  const discountTargetElementId = "elementor-popup-modal-7242";
  const discountObserver = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const addedNodes = Array.from(mutation.addedNodes);
        const targetElement = addedNodes.find(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            node.id.includes(discountTargetElementId)
        );

        if (targetElement) {
          let selected = document.querySelectorAll(".selected");
          let selectedDate = [];
          let jabamaPrice = [];
          selected.forEach((z) => {
            z.classList.remove("selected");
            selectedDate.push(
              new persianDate(parseInt(z.getAttribute("data-unix"))).format(
                "YYYY-MM-DD"
              )
            );
            jabamaPrice.push(z.getAttribute("price-from-rentamon"));
          });
          document.querySelector('input[name="form_fields[dates]"').value =
            selectedDate;
          document.querySelector(
            'input[name="form_fields[noDiscountPrice]"'
          ).value = jabamaPrice[0];

          document.querySelector('input[name="form_fields[h_f_r_i]"').value =
            rentamon_user_id;
          document.querySelector('input[name="form_fields[h_f_r_r_i]"').value =
            rentamon_room_id;
        }
      }
    }
  });
  discountObserver.observe(document.body, { childList: true, subtree: true });

  //

  // pop up form submited
  // this mutationobserver handels rentamon login form
  let form_submited = new MutationObserver((mutaionlist) => {
    for (const mutation of mutaionlist) {
      if (mutation.type === "childList") {
        const removedNodes = Array.from(mutation.removedNodes);
        if (removedNodes.length > 0) {
          const targetElement = removedNodes.find(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              node.nodeName === "SPAN" &&
              node.className.includes("elementor-form-spinner") &&
              (mutation.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id.includes(
                "7242"
              ) ||
                mutation.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id.includes(
                  "7426"
                ))
          );
          if (targetElement) {
            setTimeout(rentamoning, 2000);
          }
        }
      }
    }
  });

  form_submited.observe(document.body, { childList: true, subtree: true });



  document.querySelector(".submit").addEventListener("click", checkAction);
  document.querySelectorAll('input[name="block"]').forEach((elem) => {
    elem.addEventListener("change", (e) => {
      const actionBtn = document.querySelector(".btnActionCont button");
      if (e.target.className === "discount") {
        actionBtn.removeEventListener("click", checkAction);
        actionBtn.removeEventListener("click", priceBtnClicked);
        actionBtn.addEventListener("click", discountBtnClicked);
      } else if (e.target.className === "price") {
        actionBtn.removeEventListener("click", checkAction);
        actionBtn.removeEventListener("click", discountBtnClicked);
        actionBtn.addEventListener("click", priceBtnClicked);
      } else {
        actionBtn.addEventListener("click", checkAction);
        document.querySelector(".btnActionCont button").className = "submit";
        actionBtn.removeEventListener("click", discountBtnClicked);
        actionBtn.removeEventListener("click", priceBtnClicked);
      }
    });
  });
});

function check_is_valid(id, pop_up_id) {
  document.querySelector(id).addEventListener("click", function () {
    document.querySelector(`${pop_up_id} a`).click();
  });
}

// a function to make our code clean
function isActiveHandler(id, isRed) {
  if (isRed) {
    document.querySelector(`${id}`).style.display = "block";
    document.querySelector(`${id} div div div`).style.border =
      "4px #d71d1d solid";
    document.querySelector(`${id} div div div`).style.borderRadius = "5px";
    document.querySelector(`${id} div div div img`).style.filter =
      "grayscale(1)";
  } else if (isRed === false) {
    document.querySelector(`${id}`).style.display = "block";
    document.querySelector(`${id} div div div`).style.border =
      "4px #0c9d61 solid";
    document.querySelector(`${id} div div div`).style.borderRadius = "5px";
  }
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

// this is a function for when user selects a day, and that day need to get a class
function handleDayClick(e) {
  if (e.target.parentElement.tagName === "TD") {
    e.target.parentElement.classList.toggle("selected");
  } else if (e.target.tagName === "TD") {
    e.target.classList.toggle("selected");
  }
}