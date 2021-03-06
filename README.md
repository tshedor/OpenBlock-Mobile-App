Unofficial OpenBlock Mobile App
====================

This is a Titanium for Mobile Project based on a the open-source project OpenBlock. 
Details for both can be found at their websites: 
http://www.appcelerator.com/products/titanium-mobile-application-development/ and 
http://openblockproject.org/ respectively.

Customize, Setup and Documentation
------------------------

I've done my best to annotate or leave comments before important lines in the code. 
Please review these before opening an issue. 

However, you'll want to change several variables:
var website (line 43)
var name (line 50)
Google Play URL (line 1093 if you distribute to Google Play)
iTunes Store URL (line 1096 if you distribute to the iTunes Store)
var analytics (the UA code at line 1116 if you intend to use Google Analytics)

You'll also want to change your typeData (line 115) to reflect your site's schemas. 
This is important as it affects the import/label/icon from the API.

Include your map icons in the images/map_icons folder. 
These must be PNG, RGB, and named exactly like the slug of the schema they represent.

IMPORTANT FOR ANDROID: get your MD5 key and put it in tiapp.xml or else the map won't work. 
http://developer.appcelerator.com/doc/mobile/android-maps 
Finally, shake and bake.

License
----------------------------------

This is released under the MIT license. All images were created by me using Photoshop 
(PSDs available on request), save the map icons. Nicholas Mollet is hosting an open-source map icon 
project at http://mapicons.nicolasmollet.com/.

This code can be reused, modified and distributed for commercial or private use.


(From Appcelerator)
----------------------------------
Stuff our legal folk make us say:

Appcelerator, Appcelerator Titanium and associated marks and logos are 
trademarks of Appcelerator, Inc. 

Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc. All Rights Reserved.

Titanium is licensed under the Apache Public License (Version 2). Please
see the LICENSE file for the full license.