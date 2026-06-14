const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The start of auth-wrapper
const authWrapperStart = '                <!-- Auth Toggle -->\n                <div class="relative" id="auth-wrapper">';
const authStartIndex = html.indexOf(authWrapperStart);

if (authStartIndex !== -1) {
    // The end of auth-wrapper is right before <!-- Sound toggle -->
    const soundToggleStart = '                <!-- Sound toggle -->\n                <button id="sound-toggle"';
    const authEndIndex = html.indexOf(soundToggleStart);
    
    if (authEndIndex !== -1) {
        // Extract the auth wrapper HTML
        const authWrapperHTML = html.substring(authStartIndex, authEndIndex);
        
        // Remove from Spotlight Menu
        html = html.substring(0, authStartIndex) + html.substring(authEndIndex);
        
        // Insert into Top Nav
        // Top nav is:
        //             <div class="flex items-center gap-4">
        //                 <a href="#top" ...>28E</a>
        //             </div>
        //         </div>
        //     </nav>
        
        const navEndMarker = '            </div>\n        </div>\n    </nav>';
        const navEndIndex = html.indexOf(navEndMarker);
        
        if (navEndIndex !== -1) {
            const insertion = '            </div>\n            <div class="flex items-center gap-2">\n' + authWrapperHTML + '            </div>\n        </div>\n    </nav>';
            html = html.substring(0, navEndIndex) + insertion + html.substring(navEndIndex + navEndMarker.length);
            
            fs.writeFileSync('index.html', html);
            console.log("Moved auth-wrapper to nav successfully.");
        } else {
            console.log("navEndMarker not found.");
        }
    } else {
        console.log("soundToggleStart not found.");
    }
} else {
    console.log("authWrapperStart not found.");
}
