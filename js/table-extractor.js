(function(){
    
    
    function log(val) { //shortcut for console.log
         return console.log(val);
     }

             ///////add commas function

    function addCommas(val) {

        if(isNaN(val)){
            return val;
        }else if ((val>999)|| (val<-999) ){
            while (/(\d+)(\d{3})/.test(val.toString())) {
                val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
            }
        }
        return val;
    }


     function setUpTHhover() { //hover report
         $("th").unbind();
         $("th").hover(function() {
             console.log(getColSpanIndex(this));
         });
     }



     function getColSpanIndex(thisTH) { //get index of TH, counting previous TH with colspans (does not look at prior rowspans)
         var thisColSpanIndex = 0;
         var thisIndex = $(thisTH).index();
         var thisTR = $(thisTH).parent();

         $("th", thisTR).each(function(i) {
             if (i < thisIndex) {
                 if ($(this).attr("colspan") > 0) {
                     thisColSpanIndex = thisColSpanIndex + Number($(this).attr("colspan"));
                 } else {
                     thisColSpanIndex++;
                 }
             }

         });

         return thisColSpanIndex;

     }

     function getTable() { //grabs the inputed table code
         var newTable = $("#tableInputArea").val();
         return newTable;
     }

     function placeTable(tableCode) { //puts the table code in the resultTableDiv
         var tableCode = tableCode || "";
         $("#resultTableDiv").html(tableCode);
     }
    
    
    
    function multiplySelectedValuesBy1000(selectedCells){ //multiplies selected cell values by 10000
           
        $(selectedCells).each(function() {
                if($(this).text().match(/\$/)){
                   var hasDollarSign = "$"; 
                }else{
                    hasDollarSign ="";
                }
                
                var thisNum = Number($(this).text().replace(/,/g,"").replace(/\$/g,"") *1000);
            
            if(!isNaN(thisNum)){
            
                    thisNum = hasDollarSign + addCommas(thisNum); //remove commas and dollars and multiply by 1000
            
                
                    
                    $(this).text(thisNum);
                }
            
            }); 
    }

     function getFilterOptions() { //gets all the selected options from dropdown, checkboxes etc.
         var filterOptionsObj = {};
         filterOptionsObj.filterRowsBySub = $("#filterRowsBySubDropDown").val();
         filterOptionsObj.removeFootnotes = $("#removeFootnotesCheckBox").is(":checked");
         filterOptionsObj.removeHeadnotes = $("#removeHeadnotesCheckBox").is(":checked");
         filterOptionsObj.removeEmptyRows = $("#removeEmptyRowsCheckBox").is(":checked");
         filterOptionsObj.removeTableWords = $("#removeTableWordsCheckBox").is(":checked");
         filterOptionsObj.multiplyValuesBy1000 = $("#multiplyValuesBy1000CheckBox").is(":checked");


         return filterOptionsObj;

     }

     function runFilters(filterOptionsObj) { //calls each filter function, sending selected params 
         applyRemoveEmptyRows(filterOptionsObj.removeEmptyRows);
         applyRemoveFootnotes(filterOptionsObj.removeFootnotes);
         applyRemoveHeadnotes(filterOptionsObj.removeHeadnotes);
         applyFilterRowsBySub(filterOptionsObj.filterRowsBySub);
         applyRemoveTableWords(filterOptionsObj.removeTableWords);
         applyMultiplyValuesBy1000(filterOptionsObj.multiplyValuesBy1000);

     }


     function applyFilterRowsBySub(filterRowsBySub) { //removes rows that aren't the chosen indent
         if (filterRowsBySub != "no") {
             subsToKeep = filterRowsBySub.split(",");
             $("#resultTableDiv tbody:first tr").each(function() {
                 var thisRow = $(this);
                 var thisClass = $("th p", thisRow).attr("class");
                 var matched = false;
                 subsToKeep.forEach(function(thisSub) { //go through chosen filter array and see if there's a match
                     if ((thisSub === "sub0") && typeof thisClass == "undefined") { //sub0 also allows no class
                         matched = true;
                     }
                     if (thisClass === thisSub) {
                         matched = true;
                     }
                 });
                 if (!matched) { //if the class wasn't found in the row, remove it.
                     $(thisRow).remove();
                 }

             })
         }
     }

     function applyRemoveFootnotes(removeFootnotes) { //removes footnotes area of table
         if (removeFootnotes) {
             $("#resultTableDiv table tbody:eq(1), #resultTableDiv table tfoot, .footnoteRefs").remove();
         }
     }

     function applyRemoveHeadnotes(removeHeadnotes) { //removes footnotes area of table
         if (removeHeadnotes) {
             $("#resultTableDiv table .headnote").remove();
         }
     }

     function applyRemoveEmptyRows(removeEmptyRows) { //removes empty rows from table
         if (removeEmptyRows) {
             $("#resultTableDiv tr").each(function() {
                 if ($.trim($(this).text()) == "") {
                     $(this).remove();
                 }
             });
         }
     }

    function applyRemoveTableWords(removeTableWords){
        if (removeTableWords){
           $("#resultTableDiv table .tableTitle").text($("#resultTableDiv table .tableTitle").text().replace(/Table A*B*-*\d*\.*/, ""));
        }
    }

    

    function applyMultiplyValuesBy1000(multiplyValuesBy1000){ //select all tbody td cells and call multiply function
        if (multiplyValuesBy1000){
            var selectedCells = $("#resultTableDiv tbody tr td");
            multiplySelectedValuesBy1000(selectedCells);
        }
    }




     function updateTableCodeOutputArea() { //gets html from display and puts it in tableCodeOutputArea textarea box
         var tableCode = $("#resultTableDiv").html();
         tableCode = tableCode.replace(/\<span class=\"deleteColumnButton\"\>X\<\/span\>/g, '')
            .replace(/\<span class=\"multiplyAreaBy1000Button\"\>\*1K\<\/span\>/g, ''); //replace x buttons 
         $("#tableCodeOutputArea").val(tableCode);
     }

     function addModifyButtons() { //add the delete column X buttons and enable them
         $("#resultTableDiv th:not(:first), #resultTableDiv thead tr:last th").append("<span class='deleteColumnButton'>X</span><span class='multiplyAreaBy1000Button'>*1K</span>");
         
         enableModifyButtons();
 
     }

     function enableModifyButtons() { //enable colomn/row x buttons - decide where they are and call row/column delete funtion
         $(".deleteColumnButton, .multiplyAreaBy1000Button").click(function() {
             
             var thisLocation = this.parentNode.parentNode.parentNode.nodeName.toLowerCase();
             var thisButtonType = $(this).attr("class");
             if (thisLocation == "thead") {
      
                        selectThisColumn($(this.parentNode), thisButtonType);
   
             } else {
                switch(thisButtonType){
                    case "multiplyAreaBy1000Button":{
                        multiplySelectedValuesBy1000($("td", $(this).parent().parent()));
                        break;
                    }
                    case "deleteColumnButton":{
                        deleteThisRow($(this.parentNode));
                        break;
                    }
                }
             
             }
             updateTableCodeOutputArea();
         
         });
     }

    
     function deleteThisRow(thisTH) { //removes row when X button clicked. activated by enableModifyButtons()
         $(thisTH).parent().remove();

     }



     function selectThisColumn(thisTH, thisButtonType) { //removes row when X button clicked. activated by enableModifyButtons()


         

         insertTHplaceholders($(thisTH).parent().parent()); // call function to insert placeholders (passes THead)

         var thisTRindex = $(thisTH).parent().index();
         var thisColSpan = Number(thisTH.attr("colspan")) || 1;
         var thisColSpanIndex = getColSpanIndex($(thisTH));


         //mark TD cells in table body that match index
         $("#resultTableDiv tbody:first tr").each(function() { 
             var thisRow = $(this);
             $($("td", thisRow).slice(thisColSpanIndex - 1, thisColSpanIndex + thisColSpan -1)).addClass("selectedForChange");

         });

         ///mark TH cells underneath for removal


             $(thisTH).addClass("selectedForChange"); //the cell that was clicked

             $("#resultTableDiv thead tr:gt(" + thisTRindex + ")").each(function() {
                 var thisRow = $(this);
                 $("th", thisRow).each(function(){
                    if((getColSpanIndex($(this)) >= thisColSpanIndex) && (getColSpanIndex($(this)) < thisColSpanIndex + thisColSpan))                      {
                            $(this).addClass("selectedForChange");
                                }           
                 });

             })


             //shorten colspan of THs above clicked cell, and if colspan is 0, mark for removal
        if(thisButtonType == "deleteColumnButton"){ //if deleting
             $("#resultTableDiv thead tr:lt(" + thisTRindex + ")").each(function() {
                var thisRow = $(this);
                 $("th", thisRow).each(function(){

                     var topColSpan = Number($(this).attr("colspan")) || 0;
                     if (getColSpanIndex($(this)) == thisColSpanIndex || (getColSpanIndex($(this)) + topColSpan -1) == thisColSpanIndex){

                        var newTopColSpan = topColSpan - thisColSpan;
                        if (newTopColSpan <1){
                            $(this).addClass("selectedForChange");
                        }else{
                            $(this).attr("colspan", newTopColSpan);
                        }
                         return false;
                    }
                });
             });

        
            removeAllSelected($(".selectedForChange")); // removes all that were highlighted (highlighted first so it won't interfere with indexing)
        }; //end if marked for deletion
         
    if (thisButtonType == "multiplyAreaBy1000Button"){  //if multiplying by 1000, call that function, passing the selected cells
        multiplySelectedValuesBy1000($("tbody td.selectedForChange"));

    }
         $(".selectedForChange").removeClass("selectedForChange");
         removeTHplaceholders();
         updateTableCodeOutputArea();

     }

     function insertTHplaceholders(THead) { //goes through THead and inserts placeholder TH cells (to help with true indexing later)
         $("tr", THead).each(function() {
             var thisRow = $(this);

             $("th", thisRow).each(function() { //look for rowspans

                 if (Number($(this).attr("rowspan")) > 1) { //if rowspan found, get info

                     var thisTH = $(this);
                     var thisRowSpan = Number(thisTH.attr("rowspan"));
                     var thisTRindex = thisTH.parent().index();

                     var thisColSpanIndex = getColSpanIndex(thisTH);
                     var thisColSpan = Number(thisTH.attr("colspan")) || 0;

                     var newPlaceHolderTH = "<th class='placeholderTH' colspan='" + thisColSpan + "'></th>" //place empty placeholder TH cell in following rows

                     $("tr:lt(" + (thisTRindex + thisRowSpan) + "):gt(" + thisTRindex + ")", THead).each(function() {
                         var thisRow = $(this);
                         $("th", thisRow).each(function(i) {

                             if (getColSpanIndex($(this)) === thisColSpanIndex) {
                                 $(newPlaceHolderTH).insertBefore($(this));
                                 return false;

                             }

                         });

                     });

                 }

             });

         });
       //  setUpTHhover();
     }

     function removeTHplaceholders(THead) {
         $(".placeholderTH").remove();
     }

     function removeAllSelected(selectedCells){
         $(selectedCells).remove();
     }

     $(document).ready(function() {
         $("#extractButton").click(function() { //when "Extract" button is clicked, call functions.
             placeTable(getTable());
             runFilters(getFilterOptions());
             addModifyButtons();
             updateTableCodeOutputArea();
          //      setUpTHhover();

         });

         $("#resultTableDiv").blur(function() { // update the code area when the table is left, after editing
             updateTableCodeOutputArea();

         })

     });
    
}());
