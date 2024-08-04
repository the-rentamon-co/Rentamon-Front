const apiHostMainUrl = "https://api-rentamon.liara.run";
const propertyIdFromQueryParams = new URL(window.location.href).searchParams.get("prop_id");

const tehranTimeZone = "Asia/Tehran";
const currentDate = new Date();
const tehranTimestamp = currentDate.toLocaleString("en-US", { timeZone: tehranTimeZone });
const tehran = new Date(tehranTimestamp).setHours(0, 0, 0, 0);

const websiteWidgets = {
  jabama: { popup_id_selector: "#newwebdisconnected_jabama", popup_link_selector: "#newwebdisconnected_jabama a", icon_selector: "#newjabama_icon_connected" },
  jajiga: { popup_id_selector: "#newwebdisconnected_jajiga", popup_link_selector: "#newwebdisconnected_jajiga a", icon_selector: "#newjajiga_icon_connected" },
  shab: { popup_id_selector: "#newwebdisconnected_shab", popup_link_selector: "#newwebdisconnected_shab a", icon_selector: "#newshab_icon_connected" },
  mihmansho: { popup_id_selector: "#newwebdisconnected_mihmansho", popup_link_selector: "#newwebdisconnected_mihmansho a", icon_selector: "#newmihmansho_icon_connected" },
  homsa: { popup_id_selector: "#newwebdisconnected_homsa", popup_link_selector: "#newwebdisconnected_homsa a", icon_selector: "#newhomsa_icon_connected" },
  otaghak: { popup_id_selector: "#newwebdisconnected_otaghak", popup_link_selector: "#newwebdisconnected_otaghak a", icon_selector: "#newotaghak_icon_connected" },
  mizboon: { popup_id_selector: "#newwebdisconnected_mizboon", popup_link_selector: "#newwebdisconnected_mizboon a", icon_selector: "#newmizboon_icon_connected" },
};

const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

const persianToInteger = (persianString) => {
  const persianNumerals = "۰۱۲۳۴۵۶۷۸۹";
  return persianString.replace(/[۰-۹]/g, (char) => persianNumerals.indexOf(char));
};

const formatPersianNumber = (input) => {
  const isNegative = input.includes('-');
  input = input.replace(/[-\s]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '/');
  return isNegative ? `${input} -` : input;
};

const convertToPersianNumber = (number) => number.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);

const reservedViewer = (text) => {
  const mapping = { host: "رزرو", jabama: "جاباما", jajiga: "جاجیگا", shab: "شب", homsa: "هومسا", mizboon: "میزبون", mihmansho: "مهمانشو", otaghak: "اتاقک" };
  return mapping[text] || "";
};

const apiUrls = {
  block: `${apiHostMainUrl}/setblock/`,
  unblock: `${apiHostMainUrl}/setunblock/`,
  calendar: `${apiHostMainUrl}/getcalendar`,
  price: `${apiHostMainUrl}/setprice/`,
  discount: `${apiHostMainUrl}/setdiscount/`,
};

const priceHandler = (element, status, mainPrice, discountedPrice) => {
  const persianNumberWithCommas = (num) => convertToPersianNumber(num.replace(/\B(?=(\d{3})+(?!\d))/g, "/"));
  const parent = element.parentElement;
  const priceElement = parent.querySelector(".price");

  if (status === "blocked") {
    priceElement.innerHTML = "";
    parent.classList.add("blocked-days");
  } else if (discountedPrice) {
    priceElement.innerHTML = persianNumberWithCommas(String(discountedPrice));
    parent.classList.toggle("discounted-days", discountedPrice !== mainPrice);
  } else if (mainPrice) {
    priceElement.innerHTML = persianNumberWithCommas(String(mainPrice));
    parent.classList.remove("discounted-days");
  }
};

const setBlockHelper = (elements) => {
  elements.forEach((elm) => {
    const reserved = elm.parentElement.querySelector(".reserved");
    if (reserved.innerHTML === "" || reserved.innerHTML === "رزرو") {
      elm.parentElement.querySelector(".price").innerHTML = "";
      elm.parentElement.classList.remove("discounted-days", "booked-days");
      elm.parentElement.classList.add("blocked-days");
      reserved.innerHTML = "";
    }
  });
};

const setAvailableHelper = (elements, selectedDate = "") => {
  elements.forEach((element, i) => {
    const parent = element.parentElement;
    const reserved = parent.querySelector(".reserved");
    if (reserved.innerHTML === "" || reserved.innerHTML === "رزرو") {
      let dayData = null;
      if (selectedDate) {
        const storedData = JSON.parse(localStorage.getItem("calendar_data"));
        dayData = storedData.calendar.find(item => item.date === selectedDate[i]);
      }

      parent.classList.remove("blocked-days", "booked-days");
      const priceElement = parent.querySelector(".price");
      if (dayData && dayData.price) {
        const price = parseInt(dayData.price) / 1000;
        const discountedPrice = price - (price * dayData.discount_percentage) / 100;
        priceElement.innerHTML = convertToPersianNumber(String(discountedPrice || price)).replace(/\B(?=(\d{3})+(?!\d))/g, "/");
        parent.classList.toggle("discounted-days", !!dayData.discount_percentage);
      } else {
        priceElement.innerHTML = "";
        parent.classList.remove("discounted-days");
      }
      reserved.innerHTML = "";
    }
  });
};

const setBookedHelper = (elements, selectedDate = true) => {
  elements.forEach((elm) => {
    const parent = elm.elem.parentElement;
    const persianNumberWithCommas = (num) => convertToPersianNumber(num.replace(/\B(?=(\d{3})+(?!\d))/g, "/"));

    if (selectedDate) {
      const day = new Date(parseInt(parent.getAttribute("data-unix"))).toISOString().substring(0, 10);
      const storedData = JSON.parse(localStorage.getItem("calendar_data"));
      const dayData = storedData.calendar.find(item => item.date === day);

      if (dayData && dayData.discount_percentage) {
        const price = parseInt(dayData.price) / 1000;
        const discountedPrice = price - (price * dayData.discount_percentage) / 100;
        parent.querySelector(".price").innerHTML = persianNumberWithCommas(String(discountedPrice));
      }
    }

    parent.classList.add("booked-days");
    parent.classList.remove("discounted-days");
    parent.querySelector(".reserved").innerHTML = reservedViewer(elm.website);
    if (elm.website === "mihmansho") parent.querySelector(".reserved").style.fontSize = "14px";
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
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

const replaceUserInfo = (userInfo) => {
  const { first_name, last_name, profile_pic_link, balance_info } = userInfo.user_info;
  document.querySelector("#profilepic div img").src = profile_pic_link;
  document.querySelector("#username div h1").innerText = `${first_name} ${last_name}`;

  let balance = balance_info ? balance_info.balance.slice(0, -1) : ' خطای سرور ';
  balance = formatPersianNumber(balance);
  document.querySelector("#creditdate div h1").innerText = `اعتبار: ${convertToPersianNumber(balance)} تومان`;
};

const panelsDropdown = (responseData) => {
  const dropdownContent = document.getElementById("dropdown-content");
  const dropdown = document.getElementById("dropdown");
  const textDropdown = document.querySelector("#text-dropdown div p");

  responseData.connected_sites.forEach((site) => {
    const option = document.createElement("li");
    option.className = "web-selected-option";
    option.innerHTML = `<span><img src="img/panel.png" alt="panel"/><p>${site.website}</p></span>`;
    option.addEventListener("click", () => {
      const selectedWebsite = document.querySelector(`#${site.website}`);
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
      selectedWebsite.dispatchEvent(event);
    });
    dropdownContent.appendChild(option);
  });

  textDropdown.innerHTML = "انتخاب پنل";
  textDropdown.style.cursor = "pointer";
  textDropdown.addEventListener("click", () => dropdown.classList.toggle("show"));
};

const widgetSetup = (widgetData) => {
  widgetData.forEach(widget => {
    const { website, prop_id, link, status } = widget;
    const widgetElem = websiteWidgets[website];

    if (status === "disconnected") {
      document.querySelector(widgetElem.popup_id_selector).style.display = "block";
      const linkElement = document.querySelector(widgetElem.popup_link_selector);
      linkElement.href = link;
      linkElement.addEventListener("click", () => {
        const fetchUrl = `${apiHostMainUrl}/webconnect?prop_id=${prop_id}&website=${website}`;
        fetchData(fetchUrl).then(() => window.location.reload()).catch(console.error);
      });
    } else {
      document.querySelector(widgetElem.icon_selector).style.opacity = "1";
      document.querySelector(widgetElem.icon_selector).addEventListener("click", () => {
        window.location.href = `https://${website}.com/${prop_id}`;
      });
    }
  });
};

const getCalendarData = async () => {
  const response = await fetchData(`${apiHostMainUrl}/getcalendar?property_id=${propertyIdFromQueryParams}`);
  localStorage.setItem("calendar_data", JSON.stringify(response));
  return response;
};

const calendarPriceSetup = (response) => {
  const calendarData = response.calendar;
  const priceElements = document.querySelectorAll(".price");

  priceElements.forEach((element) => {
    const day = new Date(parseInt(element.parentElement.getAttribute("data-unix"))).toISOString().substring(0, 10);
    const dayData = calendarData.find(item => item.date === day);

    if (dayData && dayData.discount_percentage) {
      const price = parseInt(dayData.price) / 1000;
      const discountedPrice = price - (price * dayData.discount_percentage) / 100;
      element.innerHTML = convertToPersianNumber(String(discountedPrice)).replace(/\B(?=(\d{3})+(?!\d))/g, "/");
    } else if (dayData && dayData.price) {
      const price = parseInt(dayData.price) / 1000;
      element.innerHTML = convertToPersianNumber(String(price)).replace(/\B(?=(\d{3})+(?!\d))/g, "/");
    }
  });
};

const initPage = async () => {
  try {
    const userInfo = await getUserInfo();
    replaceUserInfo(userInfo);

    const calendarData = await getCalendarData();
    calendarPriceSetup(calendarData);

    widgetSetup(userInfo.connected_sites);
    panelsDropdown(userInfo);
  } catch (error) {
    console.error("Error initializing page:", error);
  }
};

document.addEventListener("DOMContentLoaded", initPage);
