/*
The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

/*

Author: Tim Shedor
Email: editor@larryvilleku.com
Github: http://github.com/tshedor/OpenBlock-Mobile-App

One API feed, one file.

Before you get to using this, change the variables. Everything between "Global Variables for this file" to load info from API you can and should customize. And change the text on the About page to your needs. Other than that, pretty much everything is set for you, unless you want to customize the way the feed view looks or the settings view. 

Also, I got my icons from mapicons.nicholasmollet.com. He's legit. Resized them to 25 as the max dimension. Cropped out the icon itself, put in the just_icon folder before resizing. But, most importantly,

YOU MUST NAME YOUR ICONS EXACTLY AS YOU'VE NAMED YOUR SLUG ON YOUR OB SITE IN BOTH MAP_ICONS AND JUST_ICONS

Don't forget. Shoot me an email if you have questions. And please, please, please fork me and send pull requests. 
*/

Titanium.UI.setBackgroundColor('#fff'); //Keep it simple, keep it clean
var win = Ti.UI.createWindow();
var website = "http://larryvilleku.com";
var limit_value = 50 //Cause most iOS devices can handle this amount
var map_detail_height = 110; //For the detail view on the feed_row table.
if (Ti.Android) {
	limit_value = 30; //Cause some Android devices can handle more, but the least can handle just 30.
	map_detail_height = 0; //Ironically, Android can't handle more than one mapview per app...even though it's a Google map.
};
var name = 'LarryvilleKU';
//Someday I want to add a button that allows the user to visit the next page of results...the query string in the url would be ...json?limit=20&offset=20....or i+20....something like that. I've got a crude version of this with more_button (check the EventListener), but it only gets the next 20. Any ideas?
	
var feed = website+"/api/dev1/items.json?limit="+limit_value;

//These are defined at the end of the file. They're down there cause it's easier to read.
win.addEventListener('open', checkReminderToRate); //Rate this app dude
win.addEventListener('open', firstPreferences); //In case we haven't launched before 

/********************************************/
/********GLOBAL VARIABLES FOR THIS FILE******/
/********************************************/
//I tried to define all variables that showed up in more than one place.

var feed_toolbar_image_height = 35;
var feed_toolbar_image_width = 35;
var feed_toolbar_image_bottom = 2;
var title_bar_height = 55;
var feed_view_name = 'Your News';
var settings_view_width = 250;
var type_view_width = 250;
if (Titanium.Platform.osname == 'ipad') {
	settings_view_width = 600;
	type_view_width = 600;
};
var bgImage = 'images/full_bg.png';
var phone_width = Titanium.Platform.displayCaps.platformWidth;
var reduced_phone_width = ((Titanium.Platform.displayCaps.platformWidth) - 20);
var double_phone_width = (phone_width + phone_width);

//Close arrow appears in a few places
var default_button_bg = 'images/transparent_bg.png';
var default_button_selected = '';
var default_left_arrow = 'images/back_arrow.png';
var default_close_dimensions = '30';
var default_close_from_top = '15';

//Get yo style on. This changes mostly things in the feed_view detail panes.
var col1 = '#c82c2c'; //Red
var col2 = '#6082A6'; //Regular blue
var background_color = '#1D243B'; //Dark blue
var light_grey = '#e1e1e1'; //Light grey
var darker_grey = '#555'; //Grey, little darker
var link_blue = '#2A85E8'; //Light blue
var shadow_color = '#222'; //Set on heading titles
var shadow_offset = {x: -2, y: -2}; //Set on heading titles
var row_bgImage = 'images/row_bg.png'; //Set on heading backgrounds

//Set fonts. Lobster and Open from Google Web Fonts, League from Moveable Type
//These have to be set accordingly per platform. For more: https://wiki.appcelerator.org/display/guides/Custom+Fonts
var font1 = 'Lobster 1.4';
if(Ti.Platform.osname=='android') {
   font1 = 'Lobster';
} 
var font2 = 'League Gothic';
if(Ti.Platform.osname=='android') {
   font2 = 'LeagueGothic';
}
var font3 = 'Open Sans';
if(Ti.Platform.osname=='android') {
   font3 = 'OpenSans-Regular';
}  

//This table generates content for the Legend and the Preferences page. Very important that your slug matches your slug on your OB type.
var typeData = [
	{ prettyName:'Neighborhood News', hasChild:true, slug:'neighborhood-messages', desc:'Community stories from you or the grouch next door', },
	{ prettyName:'Bargains', hasChild:true, slug:'bargains', desc: 'You will know where awesome deals are going to be.', },
	{ prettyName:'Events', hasChild:true, slug:'events', desc:'There\'s a block party on Ohio next weekend', },
	{ prettyName:'Restaurants', hasChild:true, slug:'restaurants', desc:'Tonight it\'s Mass St, North Iowa or a dine-in. Check the ratings and comments', },
	{ prettyName:'Kansan Articles', hasChild:true, slug:'local-news', desc:'Mapped locations of the University Daily Kansan stories and reports', },
	{ prettyName:'Tweets', hasChild:true, slug:'tweets', desc:'Tweet with your location on in your latest 140-composition and hashtag #larryvilleku', },
	//{ prettyName:'Photos from Flickr', hasChild:true, slug:'photos', desc:'Geotagged hipster pics and snapshots of Lawrence', },
	{ prettyName:'Police Citations', hasChild:true, slug:'police-citations', desc:'Everything from an unpaid meter to an MIP to speeding on K-10', },
	{ prettyName:'Accidents', hasChild:true, slug:'car-accidents', desc:'Drive safely. Every accident within the city limits is mapped', },
];

Ti.Gesture.addEventListener('orientationchange', () => {
	phone_width = Titanium.Platform.displayCaps.platformWidth;
	reduced_phone_width = ((Titanium.Platform.displayCaps.platformWidth) - 20);
});

/********************************************/
/*************LOAD INFO FROM API*************/
/********************************************/

//Apple needs to know why we're getting User Location
Titanium.Geolocation.purpose = "Recieve User Location";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

	var data = [];
	var annotations = [];
	var xhr = Ti.Network.createHTTPClient();
	xhr.timeout = 1000000;
	xhr.open("GET", feed);
		
/*********LOAD INDICATOR**********/

	//When the feed loads, display load indicator so users can't navigate away before Feed is loaded...this is very important for Android, because TableViews get messed up if the feed loads after the TVs have been initialized
	var actInd = Titanium.UI.createActivityIndicator({ 
		bottom:200, 
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG, 
		font: {
			fontFamily:font1, 
			fontSize:26,
			fontWeight:'bold'
		}, 
		color: col1, 
		message: 'Loading...', 
		width: 'auto', 
	});
	actInd.show();
	
	//Timeout only important on Android. Titanium showed iOS some favoritism (again) and the Indicator disappears after the feed is loaded automatically. For Android, the indicator is essentially a splash screen that disables use
	setTimeout(() => { actInd.hide(); },5000);
	win.add(actInd);
	
	//In case things go bad, just get that Indicator out of there and show a big 'ol NO MAPS FOR YOU
	xhr.onerror = () => { 
		Titanium.API.log(xhr.onerror);
		actInd.hide();         
		var no_internet = Titanium.UI.createAlertDialog({
            title: 'No Internet Connection',
            message: 'Sorry, but you\'re not connected to the internet, and we can\'t load the map information or feed view. Please try again when a internet connection is avaiable.',
            buttonNames: ['Shucks',],
        });
        no_internet.show();
    };

/**********ACTUAL API LOADING*************/

 	xhr.onload = function() {
		try {
			var newsitems = JSON.parse(this.responseText).features;			 
			for (var i = 0; i < newsitems.length; i++){
				
				//Map Variables (feed view variables below. They start with "row.".)
				//Note this does not use every variable in the items.json result
				var location = newsitems[i].geometry.coordinates; //Note that this is an array, so when we get lat/lng we will call it individually
				var type = newsitems[i].properties.type;
				var title = newsitems[i].properties.title;
				var raw_date = newsitems[i].properties.item_date;
				
				//Lets make the month actually read as the text version of the month
				var month = raw_date.substring(5,7);
				month = month.replace('01','Jan');
				month = month.replace('02','Feb');
				month = month.replace('03','March');
				month = month.replace('04','April');
				month = month.replace('05','May');
				month = month.replace('06','June');
				month = month.replace('07','July');
				month = month.replace('08','Aug');
				month = month.replace('09','Sept');
				month = month.replace('10','Oct');
				month = month.replace('11','Nov');
				month = month.replace('12','Dec');
				var day = raw_date.substring(8,10);
				var date = month+' '+day;
				if(title.length >= 60 ) {
					title = title.substr(0,60);
					title = title+'...'
				}
				
                //because the photos type generates nothing
				if(type !== 'photos') {

				//Make a marker for the map
				//Now...a word to the wise. You must name your map icons to be identical to the slug of whatever schema it relates to. Also, it's referring a backwards directory because Titanium optimizes for Android/iPhone when you set up a recursive directory call. Least I think so. Someone correct me if I'm wrong.
				var mrker = Titanium.Map.createAnnotation({
					latitude:location[1],
					longitude:location[0],
					title,
					image:'images/map_icons/'+type+'.png',
					animate:true,
					leftButton:'images/map_icons/just_icons/'+type+'.png',
					id:i //setting an custom attribute important later (see mapview.addEventListener later in the file)
				});
				annotations.push(mrker);  //Let the map know wassup

/*******FEED VIEW APPEARANCE*********/
				
				var row = Ti.UI.createTableViewRow({hasChild:false,height:'auto',id:i}); //Begin with the Feed View by making a TableView. Alse, note custom attribute this is used for the scrollToIndex noted in the mapview.addEventListener code later in the file

				// Hold the info for each newsitem
				var newsitem_view = Ti.UI.createView({
					height:85,
					layout:'vertical',
					left:10,
					top:10,
					bottom:5,
					right:10,
					backgroundColor:'white',
					borderRadius:7,
					borderColor:'#b4b4b4',
					borderWidth:2,
				});
				
				//That red box that holds date info
				var meta_view = Ti.UI.createView({
					height:32,
					width:82,
					backgroundImage:'images/red_bg.png',
					top:-2,
					left:-2,
					borderRadius:7,
					borderColor:'#b4b4b4',
					borderWidth:1,
				});
				
				//Created at info
				var date_label = Ti.UI.createLabel({
					text:date.toUpperCase(),
					left:8,
					top:-26,
					height:25,
					width:'auto',
					color:'#fff',
					font:{fontFamily:font2,fontSize:24}
				});

				//Map icon of schema (type)
				var map_icon_view = Ti.UI.createImageView({
					image:'images/map_icons/just_icons/'+type+'.png',
					right:4,
					top:-31,
					height:35,
					width:35,
				});

				//Newsitem Title info
				var newsitem_title = Ti.UI.createLabel({
					text:title,
					left:10,
					top:-2,
					height:'auto',
					width:'85%',
					color:darker_grey,
					font:{fontFamily:font3, fontSize:15}
				});
				
				//Combine the elements
				newsitem_view.add(meta_view);
				newsitem_view.add(date_label);
				newsitem_view.add(map_icon_view);
				newsitem_view.add(newsitem_title);
				
				//And put it all together...
				row.add(newsitem_view);
				row.className = 'item'+i;
				data[i] = row;
				
/******* FEED VIEW VARIABLES FOR DETAIL VIEW *********/

				//row.description would follow the format, but Description is actually an attribute for TableRow defaults. So content it is.
				row.content = newsitems[i].properties.description;
				row.color = newsitems[i].properties.color;
				row.type = type;
				row.url = newsitems[i].properties.description;
				//row.title would follow the format, but Title is actually an attribute for this and that. So heading it is.
				row.heading = newsitems[i].properties.title;
				row.created_at = date;
				row.news_id = newsitems[i].properties.id;
				row.location = location;
			};
			}
			//End feed data, things generated by said feed
				
/********************************************/
/*****************HEADING BAR****************/
/********************************************/	
	
			//This appears at the top through out pretty much the whole app, besides the settings view. The vars here are pretty self-explanatory.
			var heading_bar = Titanium.UI.createView({
				top:0,
				height:title_bar_height,
				backgroundImage:bgImage,
			});
           	
           	//heading_text.text will be overwritten periodically....
			var heading_text = Titanium.UI.createLabel({
				shadowColor: shadow_color,
				shadowOffset: shadow_offset,
				color:'#fff',
				height:title_bar_height,
				text:'Map',
				textAlign:'center',
				width:phone_width,
				font:{
					fontFamily:font1,
					fontSize:30,
				}
			});
			
			var settings_button = Titanium.UI.createButton({
				left:10,
				top:0,
				image:'images/settings.png',
				height:title_bar_height,
				width:'auto',
				backgroundImage: default_button_bg,
				backgroundSelectedImage: default_button_selected,
				borderWidth: 0,
				borderColor: 'transparent',
            });
			
			var settings_title = Titanium.UI.createLabel({
				shadowColor: shadow_color,
				shadowOffset: shadow_offset,
				color:'#ffffff',
				backgroundImage: bgImage,
				height:title_bar_height,
				text:'Navigate',
				textAlign:'center',
				width:settings_view_width,
				top:2,
				font:{
					fontFamily:font1,
					fontSize:30,
				}
			});
			
/********************************************/
/*****SETTINGS PANE AND INSIDE VIEWS*********/
/********************************************/	
			
			var settings_view = Titanium.UI.createView({ 
				width:settings_view_width,
				left: '-'+settings_view_width,
				height: '100%',
			});
            
			//For ViewOptions
			var type_view = Titanium.UI.createView({ 
				backgroundImage:bgImage,
				width:type_view_width,
				left: '-'+type_view_width,
				top:title_bar_height,
				bottom:0,
			});
			
			//Black to show you're in a different pane. Doesn't work on Android because opacity isn't supported in Titanium API for Android.
			var overlay = Titanium.UI.createView({
				backgroundColor: 'black',
				width:phone_width,
				opacity:0,
				visible:false
			});
            
            var settings_close = Titanium.UI.createButton({
				image: default_left_arrow,
				backgroundImage: default_button_bg,
				backgroundSelectedImage: default_button_selected,
				left:5,
				top:default_close_from_top,
				height:default_close_dimensions,
				width:default_close_dimensions,
            });
			
			//Settings button function        	
            settings_button.addEventListener('click',() => {
           		//If settings_view is already there, then go ahead and get out of here
				if(settings_view.left === '0') {
           			overlay.animate({opacity:0,duration:300});
           			settings_view.animate({left:'-'+settings_view_width,duration:300});
           			overlay.visible = false;
           		} else {
					Titanium.App.Analytics.trackPageview('/settings-view/'); //Fire analytics listener
           			overlay.visible = true;
           			overlay.animate({opacity:0.6,duration:300});
           			settings_view.animate({left:0,duration:300});
           		}
           	});
           	
           	settings_close.addEventListener('click',() => {
           		overlay.visible = false;
           		overlay.animate({opacity:0,delay:100,duration:300});
           		settings_view.animate({left:'-'+settings_view_width,duration:300});
           	});
           	
           	//Log this so that we have better Android capabilities. The back button works just like the back arrow at the top.
			settings_view.addEventListener('android:back',() => {
           		overlay.visible = false;
           		overlay.animate({opacity:0,delay:100,duration:300});
           		settings_view.animate({left:'-'+settings_view_width,duration:300});			
			});
			
			//Learned how from http://cssgallery.info/custom-row-for-tableview-in-appcelerator-titanium/
			//Create the source data
			var settingsData = [
				{ heading:'Map', event:'map', hasChild:true, newwin:false, },
				{ heading:feed_view_name, event:'map', hasChild:true, newwin:false, },
				{ heading:'Submit', event:'map', hasChild:true, newwin:true, },
				{ heading:'Refresh', event:'map', hasChild:true, newwin:false, },
				{ heading:'Preferences', event:'map', hasChild:true, newwin:false, },
				{ heading:'Legend', event:'map', hasChild:true, newwin:false, },
				{ heading:'About & Policies', event:'map', hasChild:true, newwin:true, },
				{ heading:'Contact & Feedback', event:'map', hasChild:true, newwin:true, },
			];

			settings = []; //Empty feed we'll push into
			
			//Set up the variables for each item in the source of settings
			for (var c = 0; c < settingsData.length; c++) {
				var settingsRow = Titanium.UI.createTableViewRow();
				var settingsHeading =  Titanium.UI.createLabel({
					text:settingsData[c].heading.toUpperCase(),
					font:{
						fontFamily:font2,
						fontSize:32,
					},
					width:'auto',
					left:5,
					textAlign:'left',
					color: background_color
				});
 
				settingsRow.add(settingsHeading);
				settingsRow.hasChild=settingsData[c].hasChild; //SettingsData has arrows on the left
 				
				settingsRow.className = 'settingsRow';
 				settingsRow.newwin = settingsData[c].newwin;				
 				settingsRow.winurl = settingsData[c].winurl;
 				settingsRow.heading = settingsData[c].heading;
 				settingsRow.backgroundColor = 'white';				

				settings.push(settingsRow); //Send it to the array that holds it and will eventually go into the TableView
			};
			
			//Our eventListener for this is way way down away after we set up all our views that are associated with settings
			var settingsTable = Titanium.UI.createTableView({
				width:settings_view_width,
				data:settings,
				minRowHeight:50,
				color:col1,
				rowBackgroundColor:'white',
				backgroundColor:'white',
				top:title_bar_height,
			});
			
/*****Preferences PANE/TYPE_VIEW*********/

			//Same technique from before in the settings table view http://cssgallery.info/custom-row-for-tableview-in-appcelerator-titanium/
			typeArray = [];						
						
			for (var t = 0; t < typeData.length; t++) {
				var typePrettyName = typeData[t].prettyName;
								
				var typeRow = Titanium.UI.createTableViewRow();

				var typeHeading =  Titanium.UI.createLabel({
					text:typePrettyName.toUpperCase(), //.toUpperCase() is not necessary, I only did it because I'm using League and it looks bad when it's just lowercase
					font:{
						fontFamily:font2,
						fontSize:24,
					},
					width:'auto',
					left:90,
					textAlign:'left',
					color:col2
				});
				
				var typeStatus = Titanium.App.Properties.getString(typeData[t].slug); //This is set upon row click. Listener is later
				
				var typeIcon = Titanium.UI.createImageView({
					image: 'images/map_icons/just_icons/'+typeData[t].slug+'.png', //This is why settings image names to the same as slug is important
					left:40,
					width:30,
					height:30,
				});
				
				typeStatus[t] = typeData[t].slug;
				typeRow.add(typeIcon);
				typeRow.add(typeHeading);
				typeRow.hasChild=false;
 				typeRow.leftImage = 'images/'+typeStatus+'.png';	
 				 				
				typeRow.className = 'typeRow';
 				typeRow.heading = typeData[t].heading;

				typeArray.push(typeRow);
				
				typeArray[t] = typeRow;
				typeRow.backgroundColor = 'white';
				
				//So that the event listener can adjust properties
				typeRow.slug = typeData[t].slug;
				typeRow.backgroundColor = typeRow.backgroundColor;
				typeRow.id = t;
			};
			
			//Y'all seen this before
			var typeClose = Titanium.UI.createButton({
				image: default_left_arrow,
				backgroundImage: default_button_bg,
				backgroundSelectedImage: default_button_selected,
				left:5,
				height:default_close_dimensions,
				width:default_close_dimensions,
				top:default_close_from_top,
				visible:false,
            });
            
            typeClose.addEventListener('click', () => {
            	type_view.animate({left:'-'+type_view_width,duration:300});
            	settings_close.visible = true;
            	typeClose.visible = false;
            	settings_title.text = 'Navigate';
            });

           	//And again, adding Android functions
			type_view.addEventListener('android:back',() => {
            	type_view.animate({left:'-'+type_view_width,duration:300});
            	settings_close.visible = true;
            	typeClose.visible = false;
            	settings_title.text = 'Navigate';		
			});
			        
            var typeSave = Titanium.UI.createButton({
				bottom:0,
				height:title_bar_height,
				width:'100%',
				backgroundImage: bgImage,
				backgroundSelectedImage: default_button_selected,
				borderWidth: 0,
				borderColor: 'transparent',
            });
           	
			var typeSaveText = Titanium.UI.createLabel({
				shadowColor: shadow_color,
				shadowOffset: shadow_offset,
				color:'#fff',
				height:title_bar_height,
				text:'Save',
				textAlign:'center',
				width:phone_width,
				font:{
					fontFamily:font1,
					fontSize:30,
				}
			});
			typeSave.add(typeSaveText);
            			
			typeSave.addEventListener('click',() => {
				actInd.show();
					setTimeout(() => {
						actInd.hide();
					},1000);
                annotations = [];
                xhr.open("GET",feed);
 				xhr.send();
			});
			type_view.add(typeSave);

			var typeTable = Titanium.UI.createTableView({
				width:type_view_width,
				data:typeArray,
				minRowHeight:58,
				color:col1,
				rowBackgroundColor:'white',
				backgroundColor:'white',
				top:0,
				bottom:title_bar_height,
			});
			
			typeTable.addEventListener('click',e => {
				if (Titanium.App.Properties.getString(e.rowData.slug) === 'hidden') {
					Titanium.App.Properties.setString(e.rowData.slug, 'shown')
					e.rowData.leftImage = 'images/shown.png'; //Changes to red to signify it's hidden
					feed += '&type='+e.rowData.slug; //Change the feed to include the slug
					Titanium.App.Analytics.trackPageview('/view-options/'+e.rowData.slug+'shown'); //Fire analytics listener. From a customer service standpoint, to know what people  do like to see on their map.
				} else {
					Titanium.App.Properties.setString(e.rowData.slug, 'hidden');
					e.rowData.leftImage = 'images/hidden.png'; //Changes to red to signify it's hidden
					feed = feed.replace(('&type='+e.rowData.slug),''); //Change the feed to include the slug
					Titanium.App.Analytics.trackPageview('/view-options/'+e.rowData.slug+'hidden'); //Fire analytics listener. From a customer service standpoint, to know what people don't like to see on their map.
				};
			});
			type_view.add(typeTable);
			
/*****LEGEND VIEW/HELP*********/
			
			//Begin help/legend view
			legendData = [];
			
			for (var h=0; h < typeData.length; h++) {
				var legendRow = Titanium.UI.createTableViewRow();
				var legendHeading =  Titanium.UI.createLabel({
					text:typeData[h].prettyName.toUpperCase(), //Get the names
					font:{
						fontFamily:font2,
						fontSize:22,
					},
					width:'auto',
					left:45,
					top:10,
					height:15,
					color: col1
				});
				
				var legendImage = Titanium.UI.createImageView({
					image:'images/map_icons/just_icons/'+typeData[h].slug+'.png', //I didn't want to use the map_icons because I didn't like the look of the down arrow. You can use map_icons if you so please.
					left:5,
					top:3,
					height:30,
					width:30,
				});
				
				var legendDesc = Titanium.UI.createLabel({
					text:typeData[h].desc, //Because images are worth 1,000 words, but they're still not always clear
					font:{
						fontFamily:font3,
						fontSize:14,
					},
					width:'70%',
					left:45,
					top:15,
					color: darker_grey
				});
 
				legendRow.add(legendHeading);
				legendRow.add(legendImage);
				legendRow.add(legendDesc);
 				
				legendRow.className = 'legendRow'; //Make sure Titanium can distinguish this table

				legendData.push(legendRow);
			};
			
			//Yada yada yada. This is just copy/pasted/recycled. If you have questions, email me.			
			var legend_view = Ti.UI.createView({
				backgroundColor:'white',
				width:type_view_width,
				left: '-'+type_view_width,
				height: '100%',
				top:title_bar_height,
			});

			var legendTable = Titanium.UI.createTableView({
				data:legendData,
				rowHeight:120,
				color:col1,
				rowBackgroundColor:'white',
				backgroundColor:'white',
				top:0,
				bottom:title_bar_height,
			});
			
			var legendClose = Titanium.UI.createButton({
				image: default_left_arrow,
				backgroundImage: default_button_bg,
				backgroundSelectedImage: default_button_selected,
				left:5,
				height:default_close_dimensions,
				width:default_close_dimensions,
				top:default_close_from_top,
				visible:false,
            });
            
            legendClose.addEventListener('click', () => {
            	legend_view.animate({left:'-'+type_view_width,duration:300});
            	settings_close.visible = true;
            	legendClose.visible = false;
            	settings_title.text = 'Navigate';
            });
            
            //ANDROID
			legend_view.addEventListener('android:back',() => {
            	legend_view.animate({left:'-'+type_view_width,duration:300});
            	settings_close.visible = true;
            	legendClose.visible = false;
            	settings_title.text = 'Navigate';	
			});
			
			legend_view.add(legendTable);
			
/*****SUBMIT VIEW*********/
			
			//Have not worked too extensively with the POST API cause I'm on a deadline. So we're just going to do a webview. But in the future I plain to make this all native, no external webview			
			var submit_view = Ti.UI.createView({
				backgroundColor:'white',
				width:phone_width,
				left: '-'+double_phone_width,
				height: '100%',
				top:title_bar_height,
			});
			
			var submitWeb = Titanium.UI.createWebView({
				url:website+'/neighbornews/message/new/',
			});
			
			var submitClose = Titanium.UI.createButton({
				image: default_left_arrow,
				backgroundImage: default_button_bg,
				backgroundSelectedImage: default_button_selected,
				left:5,
				height:default_close_dimensions,
				width:default_close_dimensions,
				top:default_close_from_top,
				visible:false,
            });
            
            submitClose.addEventListener('click', () => {
            	submit_view.animate({left:'-'+double_phone_width,duration:300});
            	settings_close.visible = true;
            	submitClose.visible = false;
            	settings_title.text = 'Navigate';
            	settings_view.width = settings_view_width;
            	settings_title.width = settings_view_width;
            });
            
            //DROID
			submit_view.addEventListener('android:back',() => {
            	submit_view.animate({left:'-'+double_phone_width,duration:300});
            	settings_close.visible = true;
            	submitClose.visible = false;
            	settings_title.text = 'Navigate';
            	settings_view.width = settings_view_width;
            	settings_title.width = settings_view_width;	
			});
			
            submit_view.add(submitWeb);
			
/*****ABOUT VIEW/HELP*********/
            
			//About view
			var about_view = Ti.UI.createView({
				backgroundColor:'white',
				width:type_view_width,
				left: '-'+type_view_width,
				top:title_bar_height,
			});
			
			//Your about view doesn't have to be crazy. This was just easier to create a webview than a bunch of misc Ti.UI properties. Don't forget to change your name, organization, and image path
			var aboutWeb = Titanium.UI.createWebView({
				html:'<html><head><link href="http://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css"><link href="http://fonts.googleapis.com/css?family=Lobster" rel="stylesheet" type="text/css"><style type="text/css"> body {font-family:"Open Sans",Arial,sans-serif;width:'+((type_view_width) - 20)+'px; margin-left:10px; margin-right:10px; font-size:16px; background:#fff; color:#555;} img {width:'+((type_view_width) - 20)+'px;height:auto} img.logo {margin-top:60px; margin-bottom:5px;} a {text-decoration:none; color:'+link_blue+'; } a.org_copyright {font-size:10px; color:inherit;} p {text-align:left; margin-botom:35px; font-size:14px; } p.developer {text-align:center; margin-bottom:60px; font-size:16px;} span.misc_head {font-size:16px; margin-top:30px; display:block; font-weight:bold; text-transform:uppercase; margin-bottom:0px} p.subset {text-align:left; font-size:12px;} p.misc_credits {margin-top:5px; text-align:left; font-size:12px; color:'+darker_grey+'}</style></head><body><a href="http://kansan.com" class="org_copyright">&copy; Copyright 2012 The University Daily Kansan</a><a href="'+website+'"><img src="'+website+'/dependencies/images/larryville_for_white.png" class="logo" /></a><br /><p class="developer">App Developed by Tim Shedor</p><p class="subset">This app uses open-source elements and is protected by the MIT license. For more information, visit the <a href="'+website+'/info/mobile.php">'+name+' mobile page</a> or this app\'s <a href="http://github.com/tshedor/OpenBlock-Mobile-App">Github page</a></p><a href="'+website+'/info/credits.php" style="color:'+darker_grey+'"><span class="misc_head">Misc Credits</span></a><p class="misc_credits"><em>Fonts:</em> <a href="http://www.google.com/webfonts">Google Web Fonts</a>, <a href="http://www.theleagueofmoveabletype.com/">The League of Moveable Type</a> | <em>Map Icons:</em> <a href="http://mapicons.nicolasmollet.com">Nicolas Mollet</a></p></body></html>',
            	width: type_view_width,
			});
			
			var aboutClose = Titanium.UI.createButton({
				image: default_left_arrow,
				backgroundImage: default_button_bg,
				backgroundSelectedImage: default_button_selected,
				left:0,
				height:25,
				width:25,
				top:default_close_from_top,
				visible:false,
            });
            
            aboutClose.addEventListener('click', () => {
            	about_view.animate({left:'-'+type_view_width,duration:300});
            	settings_close.visible = true;
            	aboutClose.visible = false;
            	settings_title.text = 'Navigate';
            });
            
            //BACK ARROW FOR ANDROID
			about_view.addEventListener('android:back',() => {
            	about_view.animate({left:'-'+type_view_width,duration:300});
            	settings_close.visible = true;
            	aboutClose.visible = false;
            	settings_title.text = 'Navigate';
			});
            
            about_view.add(aboutWeb);

/*****SETTINGS TABLE EVENT LISTNER*********/
			
			settingsTable.addEventListener('click', e => {
				//Every row obeys the following three lines
				overlay.animate({opacity:0,duration:300}); //Disappear overlay
           		settings_view.animate({left:'-'+settings_view_width,duration:300}); //Disappear settings view
				Titanium.App.Analytics.trackPageview('/settings-view/'+e.rowData.heading); //Fire analytics listener
           		if ((e.rowData.heading) === 'Map') {
  					feed_view.visible = false; //Get out of here feed_view
   					heading_text.text = 'Map';
					Titanium.App.Analytics.trackPageview('/'+e.rowData.heading); //Fire analytics listener
   				}
   				if ((e.rowData.heading) === feed_view_name) {
   					feed_view.visible = true; //Come back!
  					heading_text.text = feed_view_name;
					Titanium.App.Analytics.trackPageview('/'+e.rowData.heading); //Fire analytics listener
  				}
				if ((e.rowData.heading) === 'Submit') {
					submit_view.animate({left:0,duration:300}); //Slide over
					settings_view.animate({left:0,duration:300}); //Stick around settings_view - above it's set to slide over when a row is clicked.
					overlay.animate({opacity:0.6,duration:300}); //Show overlay again
					settings_title.text = 'Submit'; //Change heading text
					settings_close.visible = false; //Get rid of the other close button
					submitClose.visible = true; //Get our close button
					settings_title.width = phone_width; //And submit view is actually full screen, so adjust accordingly
					settings_view.width = phone_width;
				}
				if ((e.rowData.heading) === 'Refresh') {
					actInd.show();
						setTimeout(() => {
							actInd.hide();
						},1000);
					annotations = [];
                	xhr.open("GET",feed);
 					xhr.send();
 					Ti.API.info(feed);
				}
				if ((e.rowData.heading) === 'Preferences') {
					type_view.animate({left:0,duration:300}); //See notations under 'Submit'
					settings_view.animate({left:0,duration:300});
					overlay.animate({opacity:0.6,duration:300});
					settings_title.text = 'Preferences';
					settings_close.visible = false;
					typeClose.visible = true;
  				}
				if ((e.rowData.heading) === 'Legend') {
					legend_view.animate({left:0,duration:300}); //See notations under 'Submit'
					settings_view.animate({left:0,duration:300});
					overlay.animate({opacity:0.6,duration:300});
					settings_title.text = 'Legend';
					settings_close.visible = false;
					legendClose.visible = true;   				
				}
				if ((e.rowData.heading) === 'About & Policies') {
					about_view.animate({left:0,duration:300}); //See notations under 'Submit'
					settings_view.animate({left:0,duration:300});
					overlay.animate({opacity:0.6,duration:300});
					settings_title.text = 'About & Policies';
					settings_close.visible = false;
					aboutClose.visible = true;   				
				}
				if ((e.rowData.heading) === 'Contact & Feedback') {
					var dEmailMessage = Titanium.UI.createEmailDialog(); //Make an email form
						dEmailMessage.subject = name+' Mobile App'; //Set subjust
						dEmailMessage.toRecipients = ['tshedor@ku.edu']; //YOUR EMAIL HERE DONT FORGET
						dEmailMessage.messageBody = 'Sent from the '+name+' Mobile App'; //Set body text so that when you get an email you know where it came from...unless the email user strips this text
						//In case things go haywire...
						dEmailMessage.addEventListener('complete',e => {
    						if (e.result == demailDialog.SENT) {
        						alert("message was sent");
    						} else {
    							alert("message was not sent. result = "+e.result);
    						}
						});
					dEmailMessage.open();		
					dEmailMessage.addEventListener('open', e => {
    					Titanium.App.Analytics.trackPageview('/feedback');
					}); // I wanna now if people start an email and don't send it
  				}
			});
			
/********************************************/
/*******BEGIN ADDING THIS TOGETHER***********/
/********************************************/
						
			//Add the settings_view elements together
			settings_view.add(settings_title);
			settings_view.add(settings_close);
			settings_view.add(settingsTable);
			
			//The close buttons need to be added separately and not to their respective views. Cause those views are set off from the top.
			settings_view.add(typeClose);
			settings_view.add(legendClose);
			settings_view.add(submitClose);
			settings_view.add(aboutClose);

			//Finally the headings bar comes together
			heading_bar.add(heading_text);
			win.add(heading_bar);
			win.add(settings_button);
			
/********************************************/
/**************MASTER MAP********************/
/********************************************/

			//Make the map. This is last because it overlays above everything first
			var mapview = Titanium.Map.createView({
				mapType: Titanium.Map.STANDARD_TYPE,
				animate:true,
				region: {
					latitude:38.9622547128423, //CHANGE THIS
					longitude:-95.24254439999999, //CHANGE THIS
					latitudeDelta:0.02, //Your zoom levels
					longitudeDelta:0.02
				},
				regionFit:true,
				userLocation:true,
				visible: true,
				top:title_bar_height,
				annotations,
				zoom:20, //Don't know why this is here, but it can't hurt.
			});
			Titanium.Geolocation.distanceFilter = 10;
			
			//So here's the tricky part. They click on the icon. We can show the title on Android and a truncated title on iPhone, but that's it. So how about we make a map pin, click on the item, then click on the map_icon in the notation that appears above the icon. By clicking on that map_icon, the feed_view open up and the feed_rows is scrolled to. We're not going to create a separate view that has the full detail, because then we're generating way too much data from the feed into temporary variables. Once is enough.
	
			//I learned this from http://developer.appcelerator.com/apidoc/mobile/latest/Titanium.Map-module and http://developer.appcelerator.com/question/126136/map-annotation-click-function--animation
			mapview.addEventListener('click', evt => {
                // map event properties
                var annotation = evt.annotation;
                var title = evt.title;
                var clickSource = evt.clicksource;
                var id = evt.annotation.id; //annotation.id so that we get our custom variable
				//So that whenever they click something on the left, our scrollTo appears
                if (evt.clicksource == 'leftButton' || evt.clicksource == 'leftPane' || evt.clicksource == 'leftView') {
                	feed_view.visible = true;
                	heading_text.text = feed_view_name; //Don't forget to show that text
                	feed_rows.scrollToIndex(id); //Getting that custom var
 				}
            });


/********************************************/
/*******BACK TO THE FEED_VIEW TABLE**********/
/********************************************/			

			var feed_rows = Titanium.UI.createTableView({
				data,
				minRowHeight:58,
				backgroundColor:light_grey,
				separatorColor:light_grey, //Cause we want to draw attention to the actual content. Thus content is a lighter color than the background and not the same.
			});
			
/**********NEWSITEM MORE DETAIL VIEW*********/

			feed_rows.addEventListener('click',e => {

            	//Titanium.App.Analytics.trackPageview('/mobile-app/' + e.row.type + '/detail/' + e.row.news_id);
            	//And now, for a big 'ol cluster. CSS styles defined in the head. It's a WebView because you gotta make that HTML pretty somehow
            	var actual_content = Ti.UI.createWebView({
            		top:title_bar_height,
            		width: phone_width,
            		bottom:map_detail_height, //Only appears on iOS,
            		html:'<html><head><link href="http://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css"><link href="http://fonts.googleapis.com/css?family=Lobster" rel="stylesheet" type="text/css"><style type="text/css"> body {font-family:"Open Sans",Arial,sans-serif; width:'+reduced_phone_width+'px; font-size:16px;} img {width:'+reduced_phone_width+'px; height:auto} h3.mobile_app_only {color:'+col1+'; font-family:"Open Sans",Arial,sans-serif; font-weight:normal; font-size:22px;} a {text-decoration:none;}</style></head><body><a href="'+website+'/'+e.row.type+'/detail/'+e.row.news_id+'"><h3 class="mobile_app_only">' + e.row.heading + '</h3></a>' + e.row.content + '</body></html>'
            	});

				Titanium.App.Analytics.trackPageview('/detail-view/'+e.row.heading); //Fire analytics listener
            	
            	var detail_window = Ti.UI.createWindow({
            		navBarHidden:true,
            	});
            	
          		//Going to have to recreate the heading bar we've been failling back on for this unique modal window
				var detail_bar = Titanium.UI.createView({
					top:0,
					height:title_bar_height,
					backgroundImage:bgImage,
				});
           		
           		//Same for the text...
				var detail_text = Titanium.UI.createLabel({
					shadowColor: shadow_color,
					shadowOffset: shadow_offset,
					color:'#fff',
					height:title_bar_height,
					text:'Detail',
					textAlign:'center',
					width:phone_width,
					font:{
						fontFamily:font1,
						fontSize:30,
					}
				});
				detail_bar.add(detail_text);
            	detail_window.add(detail_bar);
				detail_window.add(actual_content);
            	
            	var detail_close = Titanium.UI.createButton({
					image: default_left_arrow,
					backgroundImage: default_button_bg,
					backgroundSelectedImage: default_button_selected,
					left:15,
					height:default_close_dimensions,
					width:default_close_dimensions,
					top:default_close_from_top,
            	});
            	
            	detail_close.addEventListener('click',() => {
                	detail_window.close();
            	});
            	
            	//And the android:back button we've come to know and love again
				detail_window.addEventListener('android:back',() => {
                	detail_window.close();
            		heading_text.text = feed_view_name;
            		settings_button.visible = true;
            		win.remove(detail_close);
				});
            	
            	//Again, Android can only display one mapview per app. Note: (!Ti.Android) does not always work for me, hence the empty brackets
            	if (Ti.Android) { } else {	
					var detail_mrker = Titanium.Map.createAnnotation({
						latitude:e.row.location[1],
						longitude:e.row.location[0],
						title:e.row.heading,
						image:'images/map_icons/'+e.row.type+'.png',
						animate:true,
					});
				
					var detail_mapview = Titanium.Map.createView({
						mapType: Titanium.Map.STANDARD_TYPE,
						animate:true,
						region: {latitude:e.row.location[1], longitude:e.row.location[0], latitudeDelta:0.002, longitudeDelta:0.002},
						regionFit:true,
						userLocation:false,
						visible: true,
						left:0,
						bottom:0,
						height:map_detail_height,
						annotations:[detail_mrker],
						zoom:40,
						borderColor:'#999',
						borderWidth:3,
					});
					Titanium.Geolocation.distanceFilter = 10; //Not sure what this does, but it doesn't hurt
				
					detail_window.add(detail_mapview);
				};
				detail_bar.add(detail_close);
            	detail_window.open({modal:true});
       		});
       		
       		//The feed view holds the items from the JSON query we made early, but it displays it as a list and not as a series of map points. It's a view because working with Titanium windows confuse me and Views are more easily animated.
        	var feed_view = Titanium.UI.createView({
        		top:title_bar_height, 
				opacity:1,
				visible:false,
			});
			feed_view.add(feed_rows);
       		
			//Where you at????? http://developer.appcelerator.com/question/97671/geolocation-refreshing-to-current-location
   			function getLocation(){
				Titanium.Geolocation.getCurrentPosition(e => {
        			var region={
						latitude: e.coords.latitude, //Standrad HTML5 getting location practice
						longitude: e.coords.longitude,
						animate:true,
						latitudeDelta:0.02,
						longitudeDelta:0.02
					};
					mapview.setLocation(region);
				});
			}
			
			win.add(mapview); //Add dat map to the screen
 			
 			Titanium.Geolocation.addEventListener('location',() => {
    			getLocation();
			}); 
			
/********************************************/
/******FINISH ADDING VIEWS TO WINDOW*********/
/********************************************/					
			
			//Alllllllll doooonnnneee
			win.add(feed_view);
			win.add(overlay);
			win.add(settings_view); //Make sure settings_view comes before everything else, so the panes set off by settings appear over
			win.add(type_view);
			win.add(legend_view);
			win.add(submit_view);
			win.add(about_view);
		}
		catch(E){
			alert(E);
		}
	};
	
/********************************************/
/************* NOTIFICATIONS ****************/
/********************************************/	

//So here's where we start having fun. Notifications were introduced from Titanium in their ACS service with the 2.0 SDK. And amazingly, they work. It's the first time I've ever used a notification service and it's actually worked in Titanium. That said, it's not well documented and there aren't many examples to use. However, after skimming forums and documentation for several hours, I Frankensteined code snippets that worked and inserted them here. I'll walk through it.

//First, iOS has a completely different setup. So we're going to split this in two for right now. Down the road, I hope to merge these so there isn't as much duplicate code.
//You're going to have to create a new app for this as well, and set Enable Cloud Services when you create it. Keep your package name and everthing, copy ONLY NECESSARY bits from your old tiapp.xml. Then copy the rest of your resources folder. In your ACS Console, click Manage next to the App, then Settings, and enter the package name for Production AND Development
if(Ti.Android) {
	
	//You need that module for Android. Check out the tiapp.xml modules section to see how to insert it.
	var CloudPush = require('ti.cloudpush');
        //CloudPush.debug = true;
        CloudPush.enabled = true; //DUH
    var deviceToken //The unique Identifier for the device. 
    
    var Cloud = require('ti.cloud'); //Another module. iOS needs this too.
        //Cloud.debug = true;
 
	CloudPush.retrieveDeviceToken({
        success: function deviceTokenSuccess(e) {
            //alert('Device Token: ' + e.deviceToken);
            deviceToken = e.deviceToken //So here we have to get the deviceToken to identify one device from another so you don't send a push to just one device.
            loginDefault(); //See function below
        },
        error: function deviceTokenError(e) {
            alert('Failed to register for push! ' + e.error);
        }
    });
 
	function loginDefault(e){ //ACS requires that all users login. Whack, I know, but it's the policy for now.
        Cloud.Users.login({ //Going to create just a regular, default user, and they're going to collect all the device tokens. Each token is another subscriber, so it's not bending the rules, this just makes it easier for users so they don't have to create an account for the app/notifications
            login: 'test@example.com',
            password: 'example_password' //Create this user for Production AND Development under ACS Console > Manage > Users > Add User
        }, e => {
            if (e.success) {
                defaultSubscribe(); //See function below
            } else {
                alert('Error:\\n' +((e.error && e.message) || JSON.stringify(e)));
            }
        });
    }
 
    function defaultSubscribe(){
        Cloud.PushNotifications.subscribe({ //Now that we've logged in, submit the data to ACS
        	channel: 'larryville_news',
        	device_token: deviceToken,
        	type: 'android' //A must, for whatever reason. Took me forever to figure this out, because it only throws an error when you install to device, not in the emulator. Type as a requirement is also not specified in the Titanium docs, just in their REST API/iOS SDK/Java SDK/JS SDK docs.
        }, e => {
        	if (e.success) {
        		//alert('Subscribed');
        	} else {
        		alert('Error:' +((e.error && e.message) || JSON.stringify(e)));
        	}
        });
    }
    
    function defaultUnsubscribe(){
    	Cloud.PushNotifications.unsubscribe({ //From the event listener above to remove the user from the list.
                channel: 'larryville_news',
                device_token: deviceToken,
        		type: 'android'
            }, e => {
                if (e.success) {
                    alert('Unsubscribed.');
                } else {
                    alert('Error:' +((e.error && e.message) || JSON.stringify(e)));
                }
            });
    }
 
 //The worst. This was a mountain of pain. So once we're all signed up, we've got to receive and parse the message. Moving on.
	CloudPush.addEventListener('callback', evt => {
		data = JSON.parse(evt.payload); //Your evt is total response text. We're going to just narrow this to the payload value, because I don't care about the rest. You can alert(evt) if you're so interested. Then we convert the JSON data into something readable.
	
		if(data.android.vibrate){ //if the vibrate property exists, then shake.
			Titanium.Media.vibrate();	
		}

		Titanium.Android.NotificationManager.notify( //An undocumented feature of the API, this is actually massively important to render notifications in the status bar.
			0,
			Ti.Android.createNotification({
				contentTitle: "LarryvilleKU: " + data.android.title, //The title
				contentText: data.android.alert, //The alert itself
				tickerText: data.android.alert, //What shows up in the bar upon first receiving notification (just duplicating the alert here)
				icon : Ti.App.Android.R.drawable.appicon, //the appicon to appear in the bar/when it's 'minimized'
				flags : Titanium.Android.ACTION_DEFAULT | Titanium.Android.FLAG_AUTO_CANCEL | Titanium.Android.FLAG_SHOW_LIGHTS,
				contentIntent: Titanium.Android.createPendingIntent({
					intent: Titanium.Android.createIntent({
						url: 'app.js' //When you click on the notification, open the app
					})
				})
			})
		)
    });
    
    
    //Lastly, for debugging purposes
    CloudPush.addEventListener('trayClickLaunchedApp', evt => {
        Ti.API.info('Tray Click Launched App (app was not running)');
    });
    CloudPush.addEventListener('trayClickFocusedApp', evt => {
        Ti.API.info('Tray Click Focused App (app was already running)');
    });
}

/********************************************/
/***MISC FUNCTIONS SET ON WIN.OPEN AT TOP****/
/********************************************/		

	function getPreferences() {
		Titanium.App.Analytics.trackPageview('/map'); //Fire analytics listener cause the app is starting
		for (var g=0; g < typeData.length; g++) {
			if(Titanium.App.Properties.getString(typeData[g].slug) === 'shown') {
				feed += '&type='+typeData[g].slug;
			}
		};
		xhr.open("GET",feed);
		xhr.send();	
	};

	//If the app is opening for the first time, set preferences because the app will crash otherwise when it queries the Titanium properties on ViewOptions (type_view). 
	//Learned from the comment on the first answer by Ravi http://developer.appcelerator.com/question/132802/check-if-the-app-is-running-on-the-first-time 
	function firstPreferences() {
		var opened = Ti.App.Properties.getString('appLaunch5');
		//We're eventually launching a window, so we have to recreate the heading bar seen elsewhere in the app
			var heading_bar = Titanium.UI.createView({
				top:0,
				height:title_bar_height,
				backgroundImage:bgImage,
			});
           	
			var heading_text = Titanium.UI.createLabel({
				shadowColor: shadow_color,
				shadowOffset: shadow_offset,
				color:'#fff',
				height:title_bar_height,
				text:'Preferences',
				textAlign:'center',
				width:phone_width,
				font:{
					fontFamily:font1,
					fontSize:30,
				}
			});

			//At the bottom, to make this intuitive, we're adding a Save button so users believe their preferences are saved. Also, the save button sets a Properties string so this window doesn't have to come up again
            var save_bar = Titanium.UI.createButton({
				bottom:0,
				height:title_bar_height,
				width:'100%',
				backgroundImage: bgImage,
				backgroundSelectedImage: default_button_selected,
				borderWidth: 0,
				borderColor: 'transparent',
            });
           	
			var save_text = Titanium.UI.createLabel({
				shadowColor: shadow_color,
				shadowOffset: shadow_offset,
				color:'#fff',
				height:title_bar_height,
				text:'Save',
				textAlign:'center',
				width:phone_width,
				font:{
					fontFamily:font1,
					fontSize:30,
				}
			});
			save_bar.add(save_text);
		//Blank response if it's already been opened. Again, (!opened) is inconsistent for me.
		if(opened){} else {
			for (var b=0; b < typeData.length; b++) {
				Titanium.App.Properties.setString(typeData[b].slug, 'shown'); //Set this as the default
			}
			var first_settings_window = Titanium.UI.createWindow({navBarHidden:true,}); //Using a window for stability's sake
			
			heading_bar.add(heading_text);
			first_settings_window.add(heading_bar);
			first_settings_window.add(save_bar);

			prefArray = [];	

			//A brief description
			var pref_about_text = Ti.UI.createLabel({
				text:'Decide which news you want to see. After all, it is your city, too.',
				font: {
					fontFamily:font3, 
					fontSize:16,
				}, 
				color: darker_grey,
				left:10,
				right:8,
				top:title_bar_height,
				height:title_bar_height,
			});
			first_settings_window.add(pref_about_text);
			
			//This is all basically taken from the first preferences setting view we set up (typeTable)			
			for (var p = 0; p < typeData.length; p++) {
				var prefPrettyName = typeData[p].prettyName;
								
				var prefRow = Titanium.UI.createTableViewRow();

				var prefHeading =  Titanium.UI.createLabel({
					text:prefPrettyName.toUpperCase(), //.toUpperCase() is not necessary, I only did it because I'm using League and it looks bad when it's just lowercase
					font:{
						fontFamily:font2,
						fontSize:24,
					},
					width:'auto',
					left:90,
					textAlign:'left',
					color:col2
				});
				
				if(!(Titanium.App.Properties.getString(typeData[p].slug))) {
					Titanium.App.Properties.setString(typeData[p].slug, 'shown');
				}
				
				var prefStatus = Titanium.App.Properties.getString(typeData[p].slug); //This is set upon row click. Listener is later
				
				var prefIcon = Titanium.UI.createImageView({
					image: 'images/map_icons/just_icons/'+typeData[p].slug+'.png',  //This is why settings image names to the same as slug is important
					left:40,
					width:30,
					height:30,
				});
				
				prefStatus[p] = typeData[p].slug;
				prefRow.add(prefIcon);
				prefRow.add(prefHeading);
				prefRow.hasChild=false;
 				prefRow.leftImage = 'images/'+prefStatus+'.png';	

				prefRow.className = 'prefRow';
 				prefRow.heading = typeData[p].heading;

				prefArray.push(prefRow);
				
				prefArray[p] = prefRow;
				prefRow.backgroundColor = 'white';
				
				//So that the event listener can adjust properties
				prefRow.slug = typeData[p].slug;
				prefRow.backgroundColor = prefRow.backgroundColor;
				prefRow.id = p;
			};
			
			var prefTable = Titanium.UI.createTableView({
				width:'100%',
				data:prefArray,
				minRowHeight:48,
				color:col1,
				rowBackgroundColor:'white',
				backgroundColor:'white',
				top:title_bar_height+title_bar_height,
				bottom:title_bar_height,
			});
			
			prefTable.addEventListener('click',e => {
				if (Titanium.App.Properties.getString(e.rowData.slug) === 'hidden') {
					Titanium.App.Properties.setString(e.rowData.slug, 'shown')
					e.rowData.leftImage = 'images/shown.png'; //Changes to green check to show it's visible
					feed += '&type='+e.rowData.slug; //Change the feed to include the slug
					Titanium.App.Analytics.trackPageview('/view-options/'+e.rowData.slug+'-shown'); //Fire analytics listener. From a customer service standpoint, to know what people  do like to see on their map.
				} else {
					Titanium.App.Properties.setString(e.rowData.slug, 'hidden');
					e.rowData.leftImage = 'images/hidden.png'; //Changes to red x to signify it's hidden
					feed = feed.replace(('&type='+e.rowData.slug),''); //Change the feed to include the slug
					Titanium.App.Analytics.trackPageview('/view-options/'+e.rowData.slug+'-hidden'); //Fire analytics listener. From a customer service standpoint, to know what people don't like to see on their map.
				};
			});
			first_settings_window.add(prefTable);
            first_settings_window.open({modal:true});
			save_bar.addEventListener('click',() => {
				Ti.App.Properties.setString("appLaunch5", JSON.stringify({opened:true})); //So we don't see this first prefences window again
				//Ti.App.Properties.setString('GPSPref', 'yes'); Note: this is a preference I need to build in down the line
				first_settings_window.close();
			});
		}
	};

    //From https://gist.github.com/1011043
	function checkReminderToRate() {
		var now = new Date().getTime();
		var remindToRate = Ti.App.Properties.getString('RemindToRate');
		if (!remindToRate) {
			Ti.App.Properties.setString('RemindToRate', now);
		}
		else if (remindToRate < now) {
			var alertDialog = Titanium.UI.createAlertDialog({
				title: 'Rate '+name,
				message: 'Would you please rate the '+name+' app?',
				buttonNames: ['OK', 'Remind Me', 'Never'],
				cancel: 2
			});
			alertDialog.addEventListener('click', evt => {
				switch (evt.index) {
					case 0:
						Ti.App.Properties.setString('RemindToRate', Number.MAX_VALUE);
						// NOTE: replace this with your own iTunes link; also, this won't WON'T WORK IN THE SIMULATOR!
						if (Ti.Android) {
							Ti.Platform.openURL('https://market.android.com/details?id=com.larryvilleku.mobile');
						}
						else {
							Ti.Platform.openURL('http://itunes.apple.com/us/app/larryvilleku/id509365461?ls=1&mt=8');
						}
						break;
					case 1:
						// "Remind Me Later"? Ok, we'll remind them tomorrow when they launch the app.
						Ti.App.Properties.setString('RemindToRate', now + (1000 * 60 * 60 * 24));
						break;
					case 2:
						Ti.App.Properties.setString('RemindToRate', Number.MAX_VALUE);
						break;
				}
			});
			alertDialog.show();
		}
	};

/*********GOOGLE ANALYTICS**********/
	
	//Roger Chapman's script to interact with Google Analytics. Read the top of analytics.js for more about this. It's not necessary, but if you disable, remove all the instances where the app fires on the event listener.
	Titanium.include('analytics.js');
	var analytics = new Analytics('UA-668650-8');
	// Call the next function if you want to reset the analytics to a new first time visit. This is useful for development only and should not go into a production app. analytics.reset();

	// The analytics object functions must be called on app.js otherwise it will loose it's context
	Titanium.App.addEventListener('analytics_trackPageview', e => {
		analytics.trackPageview('/app' + e.pageUrl);
	});

	Titanium.App.addEventListener('analytics_trackEvent', e => {
		analytics.trackEvent(e.category, e.action, e.label, e.value);
	});

	// I've set a global Analytics object to contain the two functions to make it easier to fire the analytics events from other windows
	Titanium.App.Analytics = {
		trackPageview(pageUrl) {
			Titanium.App.fireEvent('analytics_trackPageview', {pageUrl});
		},
		trackEvent(category, action, label, value) {
			Titanium.App.fireEvent('analytics_trackEvent', {category, action, label, value});
		}
	}

	// Starts a new session as long as analytics.enabled = true
	// Function takes an integer which is the dispatch interval in seconds
	analytics.start(10);

	//And now, the moment we've all been waiting for...
win.open();
win.addEventListener('open', getPreferences); //What's up with your preferences? 