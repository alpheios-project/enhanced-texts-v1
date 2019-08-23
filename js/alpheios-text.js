/**
 * @fileoverview Javascript functionality for Alpheios text pages
 *
 * @version $Id: alpheios-text.js 847 2009-03-02 16:12:49Z BridgetAlmas $
 *
 * Copyright 2008-2009 Cantus Foundation
 * http://alpheios.net
 *
 * This file is part of Alpheios.
 *
 * Alpheios is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alpheios is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function activate_alpheios_v3()
{
  const embedProps = {
    alpheiosEmbedJSURL: '../node_modules/alpheios-embedded/dist/alpheios-embedded.min.js',
    alpheiosComponentsJSURL: '../../alpheios-components/dist/alpheios-components.min.js',
    clientProps: {
                    clientId:'alpheios-enhanced-texts-v1',
                    authEnv: null,
                    enabledSelector:'.alpheios-aligned-word',
                    popupInitialPos: {
                      left: '50px',
                      top: '230px'
                    },
                    toolbarInitialPos: {
                      top: '20px',
                      right: '120px'
                    },
                    actionPanelInitialPos: {
                      top: '120',
                      right: '20'
                    }
                  }
  }
  import (embedProps.alpheiosEmbedJSURL).then(embedLib => {
    window.AlpheiosEmbed.importDependencies({
      mode: 'custom',
      libs: { components: embedProps.alpheiosComponentsJSURL }
    }).then(Embedded => {
      const embedded = new Embedded(embedProps.clientProps)
      embedded.activate()
    }).catch(e => {
      console.error(`Import of an embedded library dependencies failed: ${e}`)
    })
  }).catch(e => {
    console.error(`Import of an embedded library failed: ${e}`)
  })

  $("#alph-toolbar-v2").css("display","flex");
  $(".aligned-translation").get(0).classList.add('visible')
  $("#aligned-text-cbx").click(toggle_translation);
}

function toggle_translation() {
  let elem = $(".aligned-translation").get(0)
  elem.classList.toggle('alpheios-alignment__disabled');
  if (elem.classList.contains('alpheios-alignment__disabled')) {
    $(this).html('View Translation')
  } else {
    $(this).html('Close Translation')
  }

}
