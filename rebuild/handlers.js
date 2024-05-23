// handlers.js
import { url } from './config.js';
import { handleDayClick } from './helpers.js';

export async function rentamoning() {
  document.querySelectorAll("form").forEach((form) =>
    form.removeEventListener("submit", rentamoning)
  );

  // starts loading when this function is called
  // document.querySelector(".loading-overlay-calendar").style.display = "flex";

  // resets every action input
  document.querySelectorAll('input[name="block"]').forEach((i) => (i.checked = false));
  var availableDays = [];

  // selecting start and end of each days range
  var allTds = document.querySelectorAll(".datepicker-day-view td:not(.disabled)");
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
      new persianDate(parseInt(availableDays[0].getAttribute("data-unix"))).format("YYYY-MM-DD"),
      new persianDate(parseInt(availableDays[availableDays.length - 1].getAttribute("data-unix"))).format("YYYY-MM-DD"),
      new persianDate(parseInt(availableDays[availableDays.length - 1].getAttribute("data-unix")))
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

export async function checkAuthOnLoad() {
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
  } else {
    return true
  }
}
