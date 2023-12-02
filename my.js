var daysPicked = [];
$(document).ready(function () {
  $(".inline").pDatepicker({
    initialValue: false,
    dayPicker: {
      enabled: true,
      titleFormat: "YYYY MMMM",
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

    navigator: {
      scroll: {
        enabled: false,
      },
    },

    format: "YYYY-MM-DD",

    resoinsive: true,
    template: `<div id="plotId" class="datepicker-plot-area datepicker-plot-area-inline-view">
        {{#navigator.enabled}}
        <div class="navigator">
        <div class="datepicker-header">
        <div class="btn btn-next">></div>
        <div class="btn btn-switch">{{ navigator.switch.text }}</div>
        <div class="btn btn-prev"><</div>
        </div>
        </div>
        {{/navigator.enabled}}
        <div class="datepicker-grid-view" >
        {{#days.enabled}}
        {{#days.viewMode}}
        <div class="datepicker-day-view" >
        <div class="month-grid-box">
        <div class="header">
        <div class="title"></div>
        <div class="header-row">
        <div class="header-row-cell">شنبه</div>
        <div class="header-row-cell">یک شنبه</div>
        <div class="header-row-cell">دو شنبه</div>
        <div class="header-row-cell">سه شنبه</div>
        <div class="header-row-cell">چهار شنبه</div>
        <div class="header-row-cell">پنج شنبه</div>
        <div class="header-row-cell">جمعه</div>
        </div>
        </div>
        <table cellspacing="0" class="table-days">
        <tbody>
        {{#days.list}}
        <tr>
        {{#.}}
        {{#enabled}}
        <td data-unix="{{dataUnix}}" ><span  class="{{#otherMonth}}other-month{{/otherMonth}} {{#selected}}selected{{/selected}}">{{title}}</span></td>
        {{/enabled}}
        {{^enabled}}
        <td data-unix="{{dataUnix}}" class="disabled"><span class="day{{#otherMonth}}other-month{{/otherMonth}}">{{title}}</span></td>
        {{/enabled}}
   
        {{/.}}
        </tr>
        {{/days.list}}
        </tbody>
        </table>
        </div>
        </div>
        {{/days.viewMode}}
        {{/days.enabled}}

`,
  });
});

//   $(".inline").pDatepicker({
//     inline: true,
//     resoinsive: true,
//     format: "",
//     viewMode: "day",
//     initialValue: true,
//     minDate: null,
//     maxDate: null,
//     autoClose: false,
//     position: "auto",
//     altFormat: "",
//     altField: "#altfieldExample",
//     onlyTimePicker: false,
//     onlySelectOnDate: false,
//     calendarType: "persian",
//     inputDelay: "",
//     observer: false,
//     calendar: {
//       persian: {
//         locale: "fa",
//         showHint: false,
//         leapYearMode: "algorithmic",
//       },
//       gregorian: {
//         locale: "fa",
//         showHint: false,
//       },
//     },
//     navigator: {
//       enabled: true,
//       scroll: {
//         enabled: false,
//       },
//       text: {
//         btnNextText: "<",
//         btnPrevText: ">",
//       },
//     },
//     toolbox: {
//       enabled: false,
//       calendarSwitch: {
//         enabled: false,
//         format: "",
//       },
//       todayButton: {
//         enabled: false,
//         text: {
//           fa: "",
//           en: "",
//         },
//       },
//       submitButton: {
//         enabled: false,
//         text: {
//           fa: "",
//           en: "",
//         },
//       },
//       text: {
//         btnToday: "امروز",
//       },
//     },
//     timePicker: {
//       enabled: false,
//       step: "",
//       hour: {
//         enabled: false,
//         step: null,
//       },
//       minute: {
//         enabled: false,
//         step: null,
//       },
//       second: {
//         enabled: false,
//         step: null,
//       },
//       meridian: {
//         enabled: false,
//       },
//     },
//     dayPicker: {
//       enabled: true,
//       titleFormat: "YYYY MMMM",
//     },
//     monthPicker: {
//       enabled: false,
//       titleFormat: "YYYY",
//     },
//     yearPicker: {
//       enabled: false,
//       titleFormat: "YYYY",
//     },
//     responsive: true,
//   });

//   dayPicker: {
//     enabled: true,
//     titleFormat: "YYYY MMMM",
//   },
//   responsive: true,
//   // inline: true,
//   // observer: false,
//   navigator: {
//     scroll: {
//       enabled: false,
//     },
//     text: {
//       btnNextText: ">",
//       btnPrevText: "<",
//     },
//   },
//   initialValue: false,
//   format: "YYYY-MM-DD",
//   autoClose: true,

//   onSelect: function (unix) {
//     daysPicked.push($(".dayPicker").val());

//     console.log($(".dayPicker").val());
//   },
