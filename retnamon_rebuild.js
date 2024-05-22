let apiHostMainUrl = "https://api-rentamon.liara.run";


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
