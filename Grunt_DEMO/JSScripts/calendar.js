/*
JHSXCALE--SWJL980-03/24/08-11:14:13-C04531-LICENSED MATERIALS-                                                                                                                                                                                
PROPERTY OF SYSTEMWARE (C) COPYRIGHT SYSTEMWARE, INC 1985 - 2008 ALL RIGHTS RESERVED.
USE, DUPLICATION OR DISCLOSURE RESTRICTED BY CONTRACT WITH SYSTEMWARE, INC.
*/
///////////////////////////////////////
//    global var
///////////////////////////////////////
var g_calendar ;   // this is the main interface exposed to the JS on HTML pages
var g_bBrowserIE = navigator.appName.match(/Microsoft/);
var g_bStyleAndContainerWritten = false;  // prevent style from being mutiply written
var g_dateDelimiter = "/";
 
// define cotainer geometry; can not be changed isolated due to other code dependency
var g_iDivWidth  = g_bBrowserIE? 170 : 172;
var g_iDivHeight = g_bBrowserIE? 162 : 167;
 
///////////////////////////////////////
//    calendar class
///////////////////////////////////////
function WallCalendar() {
   //g_calendar = this;
   this.arrDayName = new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');
   this.arrMonthName = new Array('January','February','March','April','May','June','July','August','September','October','November','December');
   this.arrDaysInMonth = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
 
   // Populate the current Day|Month|Year properties
   var dateNow = new Date();
   this.year = dateNow.getFullYear();
   this.month = dateNow.getMonth();
 
   // Create the canvass that we will be displaying the calendar on
   this.canvass = document.getElementById('divCanvass');
   this.initStaticHtml();
   this.setVisibility(false);
}
 
// optional pos value of 'right' or left'.  default == 'right'
WallCalendar.prototype.Show = function(event, formName, fieldName, align) {
   if (this.isVisible) {
      //alert("close existing cal");
      this.setVisibility(false);
      return;
   }
 
   //this.setVisibility(false);
   if (g_bBrowserIE) {
      var event = window.event;
      //Set the position of the calendar object
      this.x = align=='left'? event.clientX-180 : event.clientX+22;
      this.y = event.clientY - 10;
   }
   else {
      this.x = align=='left'? event.pageX-183 : event.pageX+10;
      this.y = event.pageY - 5;
   }
 
   // apply Positioning
   if (g_bBrowserIE) {
      if (document.compatMode == "BackCompat") {
         this.canvass.style.left = this.x + document.body.scrollLeft;
         this.canvass.style.top  = this.y +document.body.scrollTop;
      }
      else {
         this.canvass.style.left = this.x + document.body.parentNode.scrollLeft;
         this.canvass.style.top  = this.y + document.body.parentNode.scrollTop;
      }
   }
   else {
      this.canvass.style.left = this.x + 7;
      this.canvass.style.top = this.y;
   }
   //alert("document.compatMode->" + document.compatMode + "<-");
   //alert("scroll body x,y=("+document.body.scrollLeft+", "+document.body.scrollTop+")\n" + "scroll body parent x,y=("+document.body.parentNode.scrollLeft+", "+document.body.parentNode.scrollTop+")")
 
   this.inputBox = document.forms[formName].elements[fieldName];
   this.setVisibility(true);
   this.renderCavass();
   setTranslucency();
   //alert("trying to show last");
}
 
WallCalendar.prototype.setVisibility = function(bVisible) {
   this.canvass.style.visibility = bVisible ? 'visible' : 'hidden';
   this.isVisible = bVisible;
   if (this.inputBox)
      if (bVisible)
         this.inputBox.className += " focused";
      else
         this.inputBox.className = this.inputBox.className.replace(/ focused\b/g, "");
   //else
      //alert("found no inputbox");
}
 
WallCalendar.prototype.buildMonthDropDownHtml = function() {
   var strHtml = '<select id="selMonth" onChange="g_calendar.MonthOnChange();"'
                  + ' onFocus="g_calendar.DisableDayOfMonth();" onBlur="g_calendar.EnableDayOfMonth();">';
   for (var nMonth=0; nMonth < this.arrMonthName.length; nMonth++) {
      strHtml += '<option value="' + nMonth + '"';
      if (nMonth == this.month)
         strHtml += ' selected';
      strHtml += '>' + this.arrMonthName[nMonth].substr(0,3) + '</option>';
   }
   strHtml += '</select>';
   return strHtml;
}
 
// init HTML for static elements
WallCalendar.prototype.initStaticHtml = function() {
   this.strCanvasHead = '<center>'
                     + '<form name="formCalendar" onsubmit="g_calendar.YearOnBlur(); return false;">'
                     //+ '<table class="tight" width="' + g_iDivWidth + '">'
                     + '<table cellpadding="0" cellspacing="0" border="0" width="' + g_iDivWidth + '">'
                     + '<tr><td>';
 
   this.strMonthRowHead = '<table cellpadding="0" cellspacing="0" border="0" width="100%">'
                        + '<tr id="trMonthYear" class="seeThrough">';
                        //+ '\n\t<th class="monthArrow" align="right">'
                        //+ '<span title="previous month" class="clickable" onClick="g_calendar.MonthClick(-1);">&lt;</span>'
                        //+ '</th>';
                        //+ '\n\t<th colspan="5">';
                        //+ '\n\t<th colspan="5"  class="panelid">';
                           // + '<select name="selMonth" onChange="g_calendar.MonthOnChange();">';
 
   this.strMonthRowTail = '</tr>'
                        + '</table></td></tr>';
 
   this.calDayNameBar = '\n<tr><td><table id="tblDateName" cellpadding="0" cellspacing="0" border="0" width="100%">'
                        + '<tr id="trWeek" class="seeThrough">';
   for (var i=0; i < this.arrDayName.length; i++)
      this.calDayNameBar += '<th width="30px">'
                           + this.arrDayName[i].substr(0,2)
                           + '</th>';
   /*
      this.calDayNameBar += '<th style="color: \'#000000\'; font: \'10pt Arial\' ;" width="30px">'
                           + this.arrDayName[i].substr(0,2)
                           + '</th>';
   */
   this.calDayNameBar += '</tr></table></td></tr>';
 
   this.strCanvasTail = '<tr><td><table cellpadding="0" cellspacing="0" border="0" width="100%">'
                        + '<tr id="trToday" class="seeThrough">'
                        + '<th colspan="7">'
                        + '<span class="clickable" onClick="g_calendar.MoveToCurrent() ;">Today</span>'
                        //+ '<a href="javascript: void(0) ;" onClick="g_calendar.MoveToCurrent() ;">Today</a>'
                        + '</th></tr></table></td></tr></table></form></center>';
}
 
// builds/accumulates the string
WallCalendar.prototype.buildCanvasHtml = function() {
   var strHtml = this.strCanvasHead
               + this.strMonthRowHead
               + '<th class="monthArrow clickable" title="previous month" onClick="g_calendar.MonthClick(-1);" align="right">&lt;</th>'
               + '<th>' + this.buildMonthDropDownHtml() + '</th>'
               + '<th class="monthArrow clickable" title="next month" onClick="g_calendar.MonthClick(1);" align="left">&gt;</th>'
               + '<th>&nbsp;&nbsp;</th>'
               + '<th class="monthArrow clickable" title="previous year" onClick="g_calendar.YearClick(-1);" align="right">&lt;&lt;</th>'
               + '<th><input id="inpYear" type="text" value="'
               + this.year + '" size="2" maxlength="4"'
               //+ ' onChange="g_calendar.YearOnChange();"'
               + ' onFocus="g_calendar.DisableDayOfMonth();"'
               + ' onBlur="g_calendar.EnableDayOfMonth();g_calendar.YearOnBlur();">'
               + '</th>'
               + '<th class="monthArrow clickable" title="next year" onClick="g_calendar.YearClick(1);" align="left">&gt;&gt;</th>'
               + this.strMonthRowTail
               + this.calDayNameBar;
 
   // Get the first and last Day numbers of the month being fetched
   var objDate = new Date( this.year, this.month, 1 );
   var firstDayInWeek = objDate.getDay();
   var lastDayOfMonth = this.daysInMonth();
 
   var prevMonth = (this.month-1)<0? 11 : this.month-1;
   var prevYear  = (this.month-1)<0? this.year-1 : this.year;
   var daysInPreviousMonth = this.daysInMonth(prevYear, prevMonth);
   var dayFromPreviousMonth = daysInPreviousMonth - (firstDayInWeek-1)
 
 
   ///////////////////////
   // day of the month
   ///////////////////////
   var nCurrentCell = 0;
   var nDayOfMonth;
   var strHtmlDate = '<tr><td><table id="tblDateEnable" class="tblDateEnable tight seeThrough" cellpadding="0" width="100%">';
 
   // write days for previous month to fill in first row
   for (nDayOfMonth = 1; nDayOfMonth-1 < firstDayInWeek; nDayOfMonth++, nCurrentCell++) {
      // new <tr> at beginning of a week
      if (nCurrentCell % 7 == 0)
         strHtmlDate += '<tr>';
      strHtmlDate += '<td class="dateDisable">' + dayFromPreviousMonth++ + '</td>';
   }
   // write days for current month
   for (nDayOfMonth = 1; nDayOfMonth <= lastDayOfMonth; nDayOfMonth++, nCurrentCell++) {
      // new <tr> at beginning of a week
      if (nCurrentCell % 7 == 0)
         strHtmlDate += '<tr>';
 
      strHtmlDate += this.isToday(nDayOfMonth,this.month,this.year)?
                  '<td class="todayEnable"'
                  :
                  '<td class="dateEnable"';
      strHtmlDate += ' onClick="g_calendar.DayClick(' + nDayOfMonth + ');">';
      //strHtmlDate += '<a href="javascript: void(0) ;" onClick="g_calendar.DayClick(' + nDayOfMonth + ') ;" class="input">'
      //         + '&nbsp;&nbsp;' + nDayOfMonth + '&nbsp;</a>';
      strHtmlDate += nDayOfMonth + '</td>';
 
      // new </tr> at end of a week
      if (nCurrentCell % 7 == 6)
         strHtmlDate += '</tr>';
   }
 
   // write days for next month to fill in trailing rows
   for (nDayOfMonth=1; nCurrentCell<42; nCurrentCell++, nDayOfMonth++) {
      // new <tr> at beginning of a week
      if (nCurrentCell % 7 == 0)
         strHtmlDate += '<tr>';
 
      // Call the method to create the cell contents
      strHtmlDate += '<td class="dateDisable">' + nDayOfMonth + '</td>';
 
      // new </tr> at end of a week
      if (nCurrentCell % 7 == 6)
         strHtmlDate += '</tr>';
   }
   strHtmlDate += '</table></td></tr>\n';
 
   var strHtmlMute = strHtmlDate.replace(/id="tblDateEnable"/, 'id="tblDateDisable" style="display:none"')
                                 //.replace(/<\/a>/g, "")
                                 //.replace(/<a [^>]+>/g, "");
                                 //.replace(/ onClick="[^"]+"/g, ' onMouseOver="this.style.visibility=\'hidden\'"'
                                   //                            + ' onMouseOut="this.style.visibility=\'visible\'"');
                                 .replace(/\btblDateEnable\b/g, 'tblDateDisable')
                                 .replace(/ onClick="[^"]+"/g, '')
                                 .replace(/class="\bdateEnable\b"/g, 'class="dateDisable"')
                                 .replace(/class="todayEnable"/g, 'class="todayDisable"');
//alert (strHtmlMute);
   strHtml += strHtmlDate + strHtmlMute;
   strHtml += this.strCanvasTail;
 
//foobar();
   return strHtml;
}   // buildCanvasHtml
 
WallCalendar.prototype.canvassDocument = function() {
   return g_bBrowserIE? this.canvass.document : this.canvass.ownerDocument;
}
 
// renders to canvass
WallCalendar.prototype.renderCavass = function() {
   this.canvass.innerHTML =  this.buildCanvasHtml();
}
 
WallCalendar.prototype.formatDate = function(n) {
   //return '' + eval(this.month+1) + '/' + n + '/' + this.year;
   var strMonth = "0" + (this.month+1);
   var strDay   = "0" + n;
   var strYear  = "000" + this.year;
   return strMonth.replace(/^\d*(\d\d)$/, "$1") + g_dateDelimiter
            + strDay.replace(/^\d*(\d\d)$/, "$1") + g_dateDelimiter
            + strYear.replace(/^\d*(\d\d\d\d)$/, "$1");
}
 
// override - optional yy, dd
// daysInMonth() || daysInMonth(y,m)     // defaults to this.year, this.month
WallCalendar.prototype.daysInMonth = function() {
   var override = (this.daysInMonth.arguments.length == 2);
   var year = override ? this.daysInMonth.arguments[0] : this.year;
   var month = override ? this.daysInMonth.arguments[1] : this.month;
 
   return (month==1 && this.isLeapYear(year))? 29 : this.arrDaysInMonth[month];
}
 
WallCalendar.prototype.isToday = function(d,m,y) {
   var now = new Date();
   var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
   return (new Date(y,m,d)).toString() == today.toString();
}
 
WallCalendar.prototype.isLeapYear = function() {
   return this.year%4==0 && (this.year%100!=0 || this.year%400==0);
}
 
///////////////////////////////////////
//    event handler method
///////////////////////////////////////
WallCalendar.prototype.DayClick = function(day) {
   this.setVisibility(false);
   this.inputBox.value = this.formatDate(day);
   // force onBlur event for validation
   this.inputBox.focus();
   this.inputBox.blur();
}
 
WallCalendar.prototype.MonthClick = function(n) {
   this.month = this.month + n;
 
   if (this.month < 0) {
      this.month = 11;
      this.year--;
   }
   else if (this.month >= 12) {
      this.month = 0;
      this.year++;
   }
   this.renderCavass();
   setTranslucency(false);
}
 
WallCalendar.prototype.YearClick = function(n) {
   this.year = this.year + n;
   this.renderCavass();
   setTranslucency(false);
}
 
WallCalendar.prototype.YearOnBlur = function() {
   //var objYear =  g_bBrowserIE? this.canvass.document.forms[0].inpYear : this.canvass.ownerDocument.forms[0].inpYear;
   var objYear =  this.canvassDocument().forms[0].inpYear;
   var strYear = objYear.value;
   if (!strYear || strYear.match(/[^\d]/)) {
      strYear = "" + (new Date()).getFullYear();
      alert("Invalid year");
      this.DisableDayOfMonth();
   }
   else {
      if (strYear.match(/^[0-6]\d$/))
         strYear = "20" + strYear;
      else if (strYear.match(/^[7-9]\d$/))
         strYear = "19" + strYear;
 
      objYear.value = strYear;
 
      this.year = flexibleParseInt(strYear);
      this.renderCavass();
      setTranslucency(false);
   }
}
 
WallCalendar.prototype.MonthOnChange = function() {
   /*
   this.month = g_bBrowserIE?
                  this.canvass.document.forms[0].selMonth.selectedIndex
                  :
                  this.canvass.ownerDocument.forms[0].selMonth.selectedIndex;
   */
   this.month =  this.canvassDocument().forms[0].selMonth.selectedIndex;
 
   this.renderCavass();
   setTranslucency(false);
}
 
// Moves the Calendar to the current Month/Year
WallCalendar.prototype.MoveToCurrent = function() {
   var dateNow = new Date();
   this.year = dateNow.getFullYear();
   this.month = dateNow.getMonth();
   this.renderCavass();
   setTranslucency(false);
}
 
WallCalendar.prototype.EnableDayOfMonth = function(bArg) {
   var objTableEnable = this.canvassDocument().getElementById("tblDateEnable");
   var objTableDisable = this.canvassDocument().getElementById("tblDateDisable");
 
   //objTable.style.visibility = bArg!==false;
   //objTable.style.display = bArg===false? "none" : "block" ; // disable iff input param is of boolean and is false
   objTableEnable.style.display = (bArg===false)? "none" : "block" ;   // disable iff input param is of boolean and is false
   objTableDisable.style.display = (bArg!==false)? "none" : "block" ;  // disable iff input param is of boolean and is false
   //objTableEnable.style.visibility = (bArg===false)? "hidden" : "visible" ;   // disable iff input param is of boolean and is false
   //objTableDisable.style.visibility = (bArg!==false)? "hidden" : "visible" ;  // disable iff input param is of boolean and is false
}
 
WallCalendar.prototype.DisableDayOfMonth = function() {
   this.EnableDayOfMonth(false);
}
 
////////////////////////////////////////////
// end of WallCalendar prototypes
////////////////////////////////////////////
 
 
///////////////////////////////////////
//    util fn
///////////////////////////////////////
function writeStyleAndContainer() {
   if (g_bStyleAndContainerWritten)
      return;
 
   g_bStyleAndContainerWritten = true;
   document.writeln('<style>\n');
   /*
   document.writeln('td.todayEnable {color:black;     background-color:gold;    cursor:hand;        font-family:Arial; font-size:8pt; text-align:center;}\n');
   document.writeln('td.todayDisable{color:LightGrey; background-color:gold;    cursor:not-allowed; font-family:Arial; font-size:8pt; text-align:center;}\n');
   document.writeln('td.dateEnable  {color:black;     background-color:#ffffff; cursor:hand;        font-family:Arial; font-size:8pt; text-align:center;}\n');
   document.writeln('td.dateDisable {color:LightGrey; background-color:#ffffff; cursor:not-allowed; font-family:Arial; font-size:8pt; text-align:center;}\n');
   */
 
   document.writeln('#divCanvass {');
   document.writeln('   position : absolute;');
   document.writeln('   width : '+g_iDivWidth+'px;');
   document.writeln('   clip:rect(0px '+g_iDivWidth+'px '+g_iDivHeight+'px 0px);');
   document.writeln('   height : '+g_iDivHeight+'px;');
   document.writeln('   visibility : hidden;');
   document.writeln('}\n');
   document.writeln('</style>\n')
   //document.writeln('<div id="divCanvass" onMouseOver="setTranslucency(false);" onMouseOut="setTranslucency();"></div>');
   document.writeln('<div id="divCanvass"></div>');
}
 
function setTranslucency(bTranslucent) {
   addSeeThroughClass("trMonthYear", false);
   addSeeThroughClass("trWeek", bTranslucent);
   addSeeThroughClass("trToday", false);
   addSeeThroughClass("tblDateEnable", bTranslucent);
   addSeeThroughClass("tblDateDisable", bTranslucent);
}
 
function addSeeThroughClass(strId, bTranslucent) {
   //alert("addSeeThroughClass("+strId+")");
   //var origParam = strId;
   var obj = objectById(strId);
   if (!obj)
      return;
   if (CALENDAR_BACKGROUND_EFFECT===false || bTranslucent===false) {
      obj.className = obj.className.replace(/ ?seeThrough/g, "");
      obj.className = obj.className.replace(/ ?translucent\d/g, "");
   }
   else {
      //obj.className += " seeThrough";
      obj.className += " translucent1";
      //setTimeout("solidify("+obj.name+")", 500);
      //alert("setTimeout(solidify("+origParam+"))");
      setTimeout("solidify(\""+strId+"\");", CALENDAR_BACKGROUND_DELAY);
      //var strTimeout = "solidify("+origParam+")";
      //setTimeout(strTimeout, 2000);
   }
}
 
function solidify(strId) {
   //alert("solidify("+strId+")");
   var obj = objectById(strId);
   if (!obj || !obj.className)
      return;
   var strLevel = obj.className.replace(/^.*translucent(\d).*$/, "$1");
   var iLevel = strLevel - 0;
   if (!iLevel || iLevel<1 || iLevel>5)
      return;
 
   if (iLevel==5)
      addSeeThroughClass(strId, false)
   //alert("trans level = "+iLevel);
 
   obj.className = obj.className.replace(/translucent4/, "translucent5");
   obj.className = obj.className.replace(/translucent3/, "translucent4");
   obj.className = obj.className.replace(/translucent2/, "translucent3");
   obj.className = obj.className.replace(/translucent1/, "translucent2");
   setTimeout("solidify(\""+strId+"\");", CALENDAR_BACKGROUND_DELAY);
}
 
function g_initCalendar() {
   //new WallCalendar(new Date());
   g_calendar = new WallCalendar();
}
 
///////////////////////////////////////
//    event handler
///////////////////////////////////////
function handleDocumentClick(objEvent) {
   if (g_bBrowserIE)
      objEvent = window.event;
 
   if (g_bBrowserIE) {
      // if user clicked inside the calendar canvass, don't hide
      if (objEvent.x > parseInt(g_calendar.canvass.style.left)
            && objEvent.y > parseInt(g_calendar.canvass.style.top)
            && objEvent.x < parseInt(g_calendar.canvass.style.left)+g_iDivWidth
            && objEvent.y < parseInt(g_calendar.canvass.style.top)+g_iDivHeight)
         return;
 
      //alert("objEvent.srcElement.name = " + objEvent.srcElement.name);
      if (objEvent.srcElement.name!='imgCalendar'/* && objEvent.srcElement.name!='selMonth'*/)
         g_calendar.setVisibility(false);
   }
   else {
      if (objEvent.pageX > parseInt(g_calendar.canvass.style.left)
            && objEvent.pageY > parseInt(g_calendar.canvass.style.top)
            && objEvent.pageX < parseInt(g_calendar.canvass.style.left)+g_iDivWidth
            && objEvent.pageY < parseInt(g_calendar.canvass.style.top)+g_iDivHeight)
         return;
 
      if (objEvent.target.name!='imgCalendar' && objEvent.target.name!='selMonth')
         g_calendar.setVisibility(false);
   }
}
 
writeStyleAndContainer();
// Instantiate the calendar
window.onload = function() { g_initCalendar() ; }
window.document.onclick = handleDocumentClick;
