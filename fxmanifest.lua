fx_version "cerulean"
game 'gta5'
client_scripts {"client/*.lua"}
server_scripts {'@oxmysql/lib/MySQL.lua', 'server/*.lua'}
lua54 "yes"
ui_page "web/index.html"
files {'web/index.html', 'web/styles.css', "web/css/all.min.css", 'web/app.js', "web/fonts/*", "web/images/*",
       "web/owlcarousel/owl.carousel.min.css", "web/owlcarousel/owl.carousel.min.js",
       "web/owlcarousel/owl.theme.default.min.css"}
dependencies {'qb-core', 'oxmysql'}
dependencies {'pma-voice' -- Or whichever voice resource you're using
}
