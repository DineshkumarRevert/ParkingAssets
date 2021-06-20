angular.module('commonServiceModule',[])
.service('commonService',function($http,$ionicPopup,$cordovaGeolocation){
	var config = {
		headers: {
			'withCredentials': true,
			'Authorization':'Basic YWRtaW46cmZpZHBhcmtpbmc=',
			'Content-type': 'application/json;charset=utf-8'
		}
	}
	return{
		commonGetAjaxService:function(url,body,callback){
			$http.get(url,body,config).success(function(data){
				callback(data);
			}).error(function(){
				callback('error');
			});
		},
		commonPostAjaxService:function(url,body,callback){
			$http.post(url,body,config).success(function(data){
				callback(data);
			}).error(function(){
				callback('error');
			});
		},
		commonUrlHitMethod:function(url,callback){
			$http.get(url).success(function(data){
				callback(data);
			}).error(function(){
				callback('error');
			});
		},
		
		commonPopup:function(title,text){
			$ionicPopup.alert({
				title: title,
				template: '<div style="text-align:center">'+text+'</div>'
			});
		},
	    showAlarmPopup : function(title, msg,closeAlarmstate) {
                var popup=$ionicPopup.alert({
                    title:"<center style='font-size:34px'>"+title+"</center>",
                    template: "<center style='font-size:18px'>"+msg+"</center>",
                    buttons: [
                        {
                            text: '<b>Stop</b>',
                            type:'button-energized',
                            onTap: function() {
                                console.log('shown');
                                popup.close();
                                if(closeAlarmstate)
                                    hideAlarmPopup();
                            }
                        }]
                    });
                },
		getformatDate:function(d,from)
		{
			var finalDate;
			var time=from =="start"? "00:00:00":from =="end"?"23:23:59":"";
			var month=(Number(d.getMonth())+1);
			month=month.toString().length>1?month:'0'+month;
			var date=d.getDate();
			date=date.toString().length>1?date:'0'+date;
			finalDate= d.getFullYear()+"-"+month+"-"+date+" "+time;
			return finalDate;
		},
		getformatTime:function(d)
		{
			var hours= d.getHours();
			hours=hours.toString().length>1?hours:'0'+hours;
			minutes=d.getMinutes();
			minutes=minutes.toString().length>1?minutes:'0'+minutes;
			return hours+":"+minutes;
		},
		commonVehicleDetails:function(responseValue){
			var details = responseValue;
			if (details.lastEntryTime == "---" && details.lastExitTime == "---"){
				var requiredValues =
				{
					"vipParkingPercentage": Math.round((details.vipParking.split('/')[0] / details.vipParking.split('/')[1]) * 100),
					"generalParkingPercentage": Math.round((details.generalParking.split('/')[0] / details.generalParking.split('/')[1]) * 100),
					"lastEntryDate": 'NA',
					"lastEntryTiming": 'NA',
					"lastExitDate": 'NA', "lastExitTiming": 'NA',
					"totalTime": Math.round(details.totalHrs / 60) + ' ' + 'hrs' + details.totalHrs % 60 + ' ' + 'minutes'
				};
				angular.merge(details, requiredValues);
			}
			else if (details.lastExitTime == "---") {
				details.lastExitTime = 'NA';
				var requiredValues =
				{
					"vipParkingPercentage": Math.round((details.vipParking.split('/')[0] / details.vipParking.split('/')[1]) * 100),
					"generalParkingPercentage": Math.round((details.generalParking.split('/')[0] / details.generalParking.split('/')[1]) * 100),
					"lastEntryDate": details.lastEntryTime.split(' ')[0],
					"lastEntryTiming": details.lastEntryTime.split(' ')[1],
					"lastExitDate": 'NA', "lastExitTiming": 'NA',
					"totalTime": Math.round(details.totalHrs / 60) + ' ' + 'hrs' + details.totalHrs % 60 + ' ' + 'minutes'
				};
				angular.merge(details, requiredValues);
			} else if(details.lastEntryTime == '---') {
				var requiredValues =
				{
					"vipParkingPercentage": Math.round((details.vipParking.split('/')[0] / details.vipParking.split('/')[1]) * 100),
					"generalParkingPercentage": Math.round((details.generalParking.split('/')[0] / details.generalParking.split('/')[1]) * 100),
					"lastEntryDate": 'NA',
					"lastEntryTiming": 'NA',
					"lastExitDate": details.lastExitTime.split(' ')[0], "lastExitTiming": details.lastExitTime.split(' ')[1],
					"totalTime": Math.round(details.totalHrs / 60) + ' ' + 'hrs' + details.totalHrs % 60 + ' ' + 'minutes'
				};
				angular.merge(details, requiredValues);
			}

			else {
				var requiredValues =
				{
					"vipParkingPercentage": Math.round((details.vipParking.split('/')[0] / details.vipParking.split('/')[1]) * 100),
					"generalParkingPercentage": Math.round((details.generalParking.split('/')[0] / details.generalParking.split('/')[1]) * 100),
					"lastEntryDate": details.lastEntryTime.split(' ')[0],
					"lastEntryTiming": details.lastEntryTime.split(' ')[1],
					"lastExitDate": details.lastExitTime.split(' ')[0],
					"lastExitTiming": details.lastExitTime.split(' ')[1],
					"totalTime": Math.round(details.totalHrs / 60) +' '+ 'hrs ' + details.totalHrs % 60 +' ' + 'minutes'
				};
				angular.merge(details, requiredValues);
			}
			var vehicleDetails = {};
			vehicleDetails = JSON.parse(JSON.stringify(details));
			console.log(vehicleDetails);
			return vehicleDetails;

		},
		downloadReport:function(data,reportName){

			var table1 =data,
			cellWidth = 130,
			rowCount = 0,
			cellContents,
			leftMargin = 30,
			topMargin = 12,
			topMarginTable = 30,
			headerRowHeight = 20,
			rowHeight = 20,
			l = {
				orientation: 'l',
				unit: 'mm',
				format: 'a3',
				compress: true,
				fontSize: 8,
				lineHeight: 1,
				autoSize: false,
				printHeaders: true
			};
			var doc = new jsPDF('p', 'pt', 'a4');
			doc.setProperties({
				title: 'Test PDF Document',
				subject: 'This is the subject',
				author: 'author',
				keywords: 'generated, javascript, web 2.0, ajax',
				creator: 'author'
			});
			doc.cellInitialize();
			$.each(table1, function (i, row)
			{
				$.each(row, function (j, cellContent) {
					if (rowCount == 1) {
						doc.margins = 1;
						doc.setFont("helvetica");
						doc.setFontType("bold");
						doc.setFontSize(12);
						doc.cell(leftMargin, topMargin, cellWidth, headerRowHeight, cellContent, i)
					}
					else {
						//doc.margins = 1;
						doc.setFont("courier ");
						doc.setFontType("normal");
						doc.setFontSize(10);
						doc.cell(leftMargin, topMargin, cellWidth, rowHeight, cellContent, i);  // 1st=left margin    2nd parameter=top margin,     3rd=row cell width      4th=Row height
					}
				})
			})
			doc.save(reportName+'.pdf');
		}
	}
});