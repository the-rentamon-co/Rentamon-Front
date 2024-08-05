const apiHostMainUrl = "https://api-rentamon.liara.run";
const propertyIdFromQueryParams = new URL(window.location.href).searchParams.get("prop_id");
const tehranTimeZone = "Asia/Tehran";

const websiteWidgets = {
  jabama: { popupId: "#newwebdisconnected_jabama", popupLink: "#newwebdisconnected_jabama a", icon: "#newjabama_icon_connected" },
  jajiga: { popupId: "#newwebdisconnected_jajiga", popupLink: "#newwebdisconnected_jajiga a", icon: "#newjajiga_icon_connected" },
  shab: { popupId: "#newwebdisconnected_shab", popupLink: "#newwebdisconnected_shab a", icon: "#newshab_icon_connected" },
  mihmansho: { popupId: "#newwebdisconnected_mihmansho", popupLink: "#newwebdisconnected_mihmansho a", icon: "#newmihmansho_icon_connected" },
  homsa: { popupId: "#newwebdisconnected_homsa", popupLink: "#newwebdisconnected_homsa a", icon: "#newhomsa_icon_connected" },
  otaghak: { popupId: "#newwebdisconnected_otaghak", popupLink: "#newwebdisconnected_otaghak a", icon: "#newotaghak_icon_connected" },
  mizboon: { popupId: "#newwebdisconnected_mizboon", popupLink: "#newwebdisconnected_mizboon a", icon: "#newmizboon_icon_connected" }
};

const url = {
  block: `${apiHostMainUrl}/setblock/`,
  unblock: `${apiHostMainUrl}/setunblock/`,
  calendar: `${apiHostMainUrl}/getcalendar`,
  price: `${apiHostMainUrl}/setprice/`,
  discount: `${apiHostMainUrl}/setdiscount/`
};

const fetchData = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const persianToInteger = (persianString) => {
  const persianNumerals = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return persianString.split("-").map(part =>
    part.split("").map(char => persianNumerals.includes(char) ? persianNumerals.indexOf(char) : char).join("")
  ).map((part, index) => index === 0 ? part : part.padStart(2, "0")).join("-");
};

const formatPersianNumber = (input) => {
  const isNegative = input.includes('-');
  input = input.replace(/[-\s]/g, '');
  const formattedNumber = input.replace(/\B(?=(\d{3})+(?!\d))/g, '/');
  return isNegative ? `${formattedNumber} -` : formattedNumber;
};

const convertToPersianNumber = (number) => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return number.replace(/\d/g, digit => persianDigits[digit]);
};

const reservedViewer = (text) => {
  const translations = {
    "host": "رزرو",
    "jabama": "جاباما",
    "jajiga": "جاجیگا",
    "shab": "شب",
    "homsa": "هومسا",
    "mizboon": "میزبون",
    "mihmansho": "مهمانشو",
    "otaghak": "اتاقک"
  };
  return translations[text] || text;
};

const priceHandler = (element, status, mainPrice, discountedPrice) => {
  const formatPersianNumWithCommas = (persianNum) =>
    persianNum.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/\B(?=(\d{3})+(?!\d))/g, "/").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

  const priceElem = element.parentElement.querySelector(".price");
  if (status === "blocked") {
    priceElem.innerHTML = "";
    element.parentElement.classList.add("blocked-days");
  } else if (discountedPrice) {
    priceElem.innerHTML = formatPersianNumWithCommas(convertToPersianNumber(String(discountedPrice)).split(".")[0]);
    element.parentElement.classList.toggle("discounted-days", discountedPrice !== mainPrice);
  } else if (mainPrice) {
    priceElem.innerHTML = formatPersianNumWithCommas(convertToPersianNumber(String(mainPrice)).split(".")[0]);
    element.parentElement.classList.remove("discounted-days");
  }
};

const setBlockHelper = (elements) => {
  elements.forEach((elm) => {
    const reserved = elm.parentElement.querySelector(".reserved");
    if (!reserved.innerHTML || reserved.innerHTML === "رزرو") {
      elm.parentElement.querySelector(".price").innerHTML = "";
      elm.parentElement.classList.remove("discounted-days", "booked-days");
      elm.parentElement.classList.add("blocked-days");
      reserved.innerHTML = "";
    }
  });
};

const setAvailableHelper = (elements, selectedDate = "") => {
  const storedData = localStorage.getItem("calendar_data");
  const jsonData = JSON.parse(storedData);

  elements.forEach((element, i) => {
    const reserved = element.parentElement.querySelector(".reserved");
    if (!reserved.innerHTML || reserved.innerHTML === "رزرو") {
      let day = selectedDate ? selectedDate[i] : null;
      if (day) day = jsonData.calendar.find((item) => item.date === day);

      element.parentElement.classList.remove("blocked-days", "booked-days");
      const priceElem = element.parentElement.querySelector(".price");

      if (day) {
        const formatPersianNumWithCommas = (persianNum) =>
          persianNum.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/\B(?=(\d{3})+(?!\d))/g, "/").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

        if (day.price) {
          const price = parseInt(day.price) / 1000 || null;
          if (day.discount_percentage) {
            const discountedPrice = price - (price * day.discount_percentage) / 100;
            priceElem.innerHTML = formatPersianNumWithCommas(convertToPersianNumber(String(discountedPrice)));
            element.parentElement.classList.add("discounted-days");
          } else {
            priceElem.innerHTML = formatPersianNumWithCommas(convertToPersianNumber(String(price)));
            element.parentElement.classList.remove("discounted-days");
          }
        }
      } else {
        priceElem.innerHTML = "";
        element.parentElement.classList.remove("discounted-days");
      }
      reserved.innerHTML = "";
    }
  });
};

const setBookedHelper = (elements, selectedDate = true) => {
  const formatPersianNumWithCommas = (persianNum) =>
    persianNum.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/\B(?=(\d{3})+(?!\d))/g, "/").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

  elements.forEach((elm) => {
    if (selectedDate) {
      let day = new Date(parseInt(elm.elem.parentElement.getAttribute("data-unix"))).toISOString().substring(0, 10);
      const storedData = localStorage.getItem("calendar_data");
      const jsonData = JSON.parse(storedData);
      const filteredData = jsonData.calendar.find((item) => item.date === day);

      if (filteredData) {
        const discountedPrice = parseInt(filteredData.price) / 1000 - (parseInt(filteredData.price) / 1000 * filteredData.discount_percentage) / 100;
        elm.elem.parentElement.querySelector(".price").innerHTML = formatPersianNumWithCommas(convertToPersianNumber(String(discountedPrice)));
      }
    }
    elm.elem.parentElement.classList.remove("discounted-days");
    elm.elem.parentElement.classList.add("booked-days");
    elm.elem.parentElement.querySelector(".reserved").innerHTML = reservedViewer(elm.website);
    if (elm.website == "mihmansho") elm.elem.parentElement.querySelector(".reserved").style.fontSize = "14px";
  });
};

const getUserInfo = async () => {
  const propertyId = propertyIdFromQueryParams;
  const authToken = getCookie("auth_token");
  if (!authToken) throw new Error("No auth token found");

  const response = await fetch(`${apiHostMainUrl}/api/user_info?property_id=${propertyId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

const renderWidgets = (data) => {
  Object.keys(websiteWidgets).forEach((widgetKey) => {
    const widget = websiteWidgets[widgetKey];
    if (data[`${widgetKey}_link`]) {
      $(widget.popupId).hide();
      $(widget.icon).show();
      $(widget.popupLink).attr("href", data[`${widgetKey}_link`]);
    } else {
      $(widget.popupId).show();
      $(widget.icon).hide();
    }
  });
};

const fillPageContent = (data) => {
  $("#prop_name").text(data.prop_name);
  $("#prop_address").text(data.prop_address);
  $("#prop_city").text(data.prop_city);
  $("#prop_phone").text(data.prop_phone);
  $("#prop_email").text(data.prop_email);
  $("#prop_website").text(data.prop_website);

  renderWidgets(data);
};

const initializePage = async () => {
  try {
    const userInfo = await getUserInfo();
    fillPageContent(userInfo);
  } catch (error) {
    console.error(error);
  }
};

$(document).ready(() => {
  initializePage();
});

// Note: Function getCookie was missing in the original code. Assuming it's a utility function, add it here:
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};
