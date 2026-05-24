package co.edu.unbosque.service;

import co.edu.unbosque.dto.HotelSuggestionDto;
import co.edu.unbosque.dto.TravelSuggestionsDto;
import co.edu.unbosque.dto.TravelSuggestionsDto.AtraccionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Sugerencias de viaje para los 16 estadios del Mundial 2026.
 *
 * Hoteles   → datos curados + deep-links reales a Booking.com (sin API).
 * Atracciones → Overpass API (OpenStreetMap): gratis, sin registro, sin API key.
 */
@Service
@Slf4j
public class AgenteViajeService {

    @Value("${opentripmap.api.key:SIN_CONFIGURAR}")
    private String otmKey;

    @Value("${overpass.api.url:https://overpass-api.de/api/interpreter}")
    private String overpassUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // ─── Estadios → ciudad + coordenadas ─────────────────────────────────────

    private static final Map<String, CiudadInfo> ESTADIO_INFO = new LinkedHashMap<>();
    static {
        ESTADIO_INFO.put("MetLife Stadium",         new CiudadInfo("Nueva York",       "US","NYC","New+York",         40.8135,-74.0745));
        ESTADIO_INFO.put("SoFi Stadium",            new CiudadInfo("Los Ángeles",      "US","LAX","Los+Angeles",      34.0522,-118.2437));
        ESTADIO_INFO.put("AT&T Stadium",            new CiudadInfo("Dallas",           "US","DFW","Dallas",           32.7767,-96.7970));
        ESTADIO_INFO.put("Levi's Stadium",          new CiudadInfo("San Francisco",    "US","SFO","San+Francisco",    37.7749,-122.4194));
        ESTADIO_INFO.put("Arrowhead Stadium",       new CiudadInfo("Kansas City",      "US","MCI","Kansas+City",      39.0997,-94.5786));
        ESTADIO_INFO.put("NRG Stadium",             new CiudadInfo("Houston",          "US","IAH","Houston",          29.7604,-95.3698));
        ESTADIO_INFO.put("Gillette Stadium",        new CiudadInfo("Boston",           "US","BOS","Boston",           42.3601,-71.0589));
        ESTADIO_INFO.put("Lincoln Financial Field", new CiudadInfo("Filadelfia",       "US","PHL","Philadelphia",     39.9526,-75.1652));
        ESTADIO_INFO.put("Hard Rock Stadium",       new CiudadInfo("Miami",            "US","MIA","Miami",            25.7617,-80.1918));
        ESTADIO_INFO.put("Mercedes-Benz Stadium",   new CiudadInfo("Atlanta",          "US","ATL","Atlanta",          33.7553,-84.4006));
        ESTADIO_INFO.put("Lumen Field",             new CiudadInfo("Seattle",          "US","SEA","Seattle",          47.6062,-122.3321));
        ESTADIO_INFO.put("BC Place",                new CiudadInfo("Vancouver",        "CA","YVR","Vancouver",        49.2827,-123.1207));
        ESTADIO_INFO.put("BMO Field",               new CiudadInfo("Toronto",          "CA","YTO","Toronto",          43.6532,-79.3832));
        ESTADIO_INFO.put("Estadio Azteca",          new CiudadInfo("Ciudad de México", "MX","MEX","Ciudad+de+Mexico", 19.4326,-99.1332));
        ESTADIO_INFO.put("Estadio BBVA",            new CiudadInfo("Monterrey",        "MX","MTY","Monterrey",        25.6866,-100.3161));
        ESTADIO_INFO.put("Estadio Akron",           new CiudadInfo("Guadalajara",      "MX","GDL","Guadalajara",      20.6597,-103.3496));
    }

    // ─── Hoteles curados por ciudad ───────────────────────────────────────────

    private static final Map<String, List<HotelSuggestionDto>> HOTELES = new HashMap<>();
    static {
        HOTELES.put("NYC", List.of(
            hotel("The New Yorker Hotel",            4,"Nueva York",  "hotel+new+yorker+new+york",          "~12 km del MetLife Stadium"),
            hotel("Marriott Marquis Times Square",   5,"Nueva York",  "marriott+marquis+times+square",      "~14 km del MetLife Stadium"),
            hotel("Hilton Midtown New York",         4,"Nueva York",  "hilton+midtown+new+york",            "~13 km del MetLife Stadium"),
            hotel("EVEN Hotel Manhattan",            3,"Nueva York",  "even+hotel+manhattan",               "~15 km del MetLife Stadium")));
        HOTELES.put("LAX", List.of(
            hotel("Courtyard Marriott Inglewood",    3,"Inglewood",   "courtyard+marriott+inglewood",       "~2 km de SoFi Stadium"),
            hotel("Holiday Inn Express LAX",         3,"Los Ángeles", "holiday+inn+express+los+angeles+lax","~5 km de SoFi Stadium"),
            hotel("JW Marriott Los Angeles",         5,"Los Ángeles", "jw+marriott+los+angeles",            "~22 km de SoFi Stadium"),
            hotel("Marriott LA Downtown",            4,"Los Ángeles", "marriott+los+angeles+downtown",      "~25 km de SoFi Stadium")));
        HOTELES.put("DFW", List.of(
            hotel("Sheraton Arlington",              4,"Arlington",   "sheraton+arlington+texas",           "~1 km del AT&T Stadium"),
            hotel("Renaissance Arlington",           4,"Arlington",   "renaissance+arlington+capital+view", "~2 km del AT&T Stadium"),
            hotel("Omni Dallas Hotel",               4,"Dallas",      "omni+dallas+hotel",                  "~8 km del AT&T Stadium"),
            hotel("Hilton Anatole Dallas",           4,"Dallas",      "hilton+anatole+dallas",              "~10 km del AT&T Stadium")));
        HOTELES.put("SFO", List.of(
            hotel("Marriott Santa Clara",            4,"Santa Clara", "marriott+santa+clara",               "~2 km del Levi's Stadium"),
            hotel("Hilton San Jose",                 4,"San José",    "hilton+san+jose+california",         "~5 km del Levi's Stadium"),
            hotel("Westin San Francisco",            4,"San Francisco","westin+san+francisco+market+street","~45 km del Levi's Stadium"),
            hotel("The St. Regis San Francisco",     5,"San Francisco","st+regis+san+francisco",            "~45 km del Levi's Stadium")));
        HOTELES.put("MCI", List.of(
            hotel("Courtyard Arrowhead Stadium",     3,"Kansas City", "courtyard+kansas+city+arrowhead",    "~1 km del Arrowhead Stadium"),
            hotel("Drury Inn Kansas City",           3,"Kansas City", "drury+inn+kansas+city",              "~6 km del Arrowhead Stadium"),
            hotel("Loews Kansas City Hotel",         4,"Kansas City", "loews+kansas+city",                  "~8 km del Arrowhead Stadium"),
            hotel("Marriott Kansas City Downtown",   4,"Kansas City", "marriott+kansas+city+downtown",      "~8 km del Arrowhead Stadium")));
        HOTELES.put("IAH", List.of(
            hotel("DoubleTree by Hilton NRG",        3,"Houston",     "doubletree+houston+nrg+stadium",     "~2 km del NRG Stadium"),
            hotel("Marriott Houston Medical Center", 4,"Houston",     "marriott+houston+medical+center",    "~10 km del NRG Stadium"),
            hotel("Hilton Americas Houston",         5,"Houston",     "hilton+americas+houston",            "~8 km del NRG Stadium"),
            hotel("Crowne Plaza Houston",            4,"Houston",     "crowne+plaza+houston+galleria",      "~12 km del NRG Stadium")));
        HOTELES.put("BOS", List.of(
            hotel("Renaissance Boston Patriot Place",4,"Foxborough",  "renaissance+boston+patriot+place",   "~500m del Gillette Stadium"),
            hotel("Westin Foxborough",               4,"Foxborough",  "westin+foxborough",                  "~1 km del Gillette Stadium"),
            hotel("Marriott Copley Place Boston",    4,"Boston",      "marriott+copley+place+boston",       "~40 km del Gillette Stadium"),
            hotel("Hilton Boston Back Bay",          4,"Boston",      "hilton+boston+back+bay",             "~38 km del Gillette Stadium")));
        HOTELES.put("PHL", List.of(
            hotel("Courtyard Lincoln Financial",     3,"Filadelfia",  "courtyard+philadelphia+lincoln+financial","~1 km del Lincoln Financial"),
            hotel("Loews Philadelphia Hotel",        4,"Filadelfia",  "loews+philadelphia+hotel",           "~9 km del Lincoln Financial"),
            hotel("Philadelphia Marriott Downtown",  4,"Filadelfia",  "philadelphia+marriott+downtown",     "~10 km del Lincoln Financial"),
            hotel("Hilton Philadelphia City Avenue", 4,"Filadelfia",  "hilton+philadelphia+city+avenue",    "~12 km del Lincoln Financial")));
        HOTELES.put("MIA", List.of(
            hotel("Courtyard Miami Hard Rock",       3,"Miami Gardens","courtyard+miami+hard+rock+stadium", "~1 km del Hard Rock Stadium"),
            hotel("Marriott Miami Dadeland",         4,"Miami",       "marriott+miami+dadeland",            "~8 km del Hard Rock Stadium"),
            hotel("Hilton Miami Downtown",           4,"Miami",       "hilton+miami+downtown",              "~20 km del Hard Rock Stadium"),
            hotel("Fontainebleau Miami Beach",       5,"Miami Beach", "fontainebleau+miami+beach",          "~25 km del Hard Rock Stadium")));
        HOTELES.put("ATL", List.of(
            hotel("Omni Atlanta Hotel at Centennial Park", 4,"Atlanta", "omni+atlanta+hotel+centennial+park", "~1 km del Mercedes-Benz Stadium"),
            hotel("The Westin Peachtree Plaza",             4,"Atlanta", "westin+peachtree+plaza+atlanta",     "~2 km del Mercedes-Benz Stadium"),
            hotel("Hyatt Regency Atlanta",                  4,"Atlanta", "hyatt+regency+atlanta",              "~3 km del Mercedes-Benz Stadium"),
            hotel("Glenn Hotel Autograph Collection",       4,"Atlanta", "glenn+hotel+atlanta",                "~1 km del Mercedes-Benz Stadium")));
        HOTELES.put("SEA", List.of(
            hotel("Courtyard Seattle Downtown",      3,"Seattle",     "courtyard+seattle+downtown",         "~4 km del Lumen Field"),
            hotel("Marriott Seattle Waterfront",     4,"Seattle",     "marriott+seattle+waterfront",        "~3 km del Lumen Field"),
            hotel("Hilton Seattle",                  4,"Seattle",     "hilton+seattle",                     "~5 km del Lumen Field"),
            hotel("The Westin Seattle",              4,"Seattle",     "westin+seattle",                     "~8 km del Lumen Field")));
        HOTELES.put("YVR", List.of(
            hotel("JW Marriott Parq Vancouver",      5,"Vancouver",   "jw+marriott+parq+vancouver",         "~500m de BC Place"),
            hotel("Marriott Vancouver Downtown",     4,"Vancouver",   "marriott+vancouver+downtown",        "~2 km de BC Place"),
            hotel("Fairmont Waterfront Vancouver",   5,"Vancouver",   "fairmont+waterfront+vancouver",      "~10 km de BC Place"),
            hotel("Hilton Vancouver Metrotown",      4,"Burnaby",     "hilton+vancouver+metrotown",         "~15 km de BC Place")));
        HOTELES.put("YTO", List.of(
            hotel("Hotel X Toronto",                 4,"Toronto",     "hotel+x+toronto",                    "~1 km del BMO Field"),
            hotel("Marriott Toronto City Centre",    4,"Toronto",     "marriott+toronto+city+centre",       "~2 km del BMO Field"),
            hotel("Fairmont Royal York Toronto",     5,"Toronto",     "fairmont+royal+york+toronto",        "~3 km del BMO Field"),
            hotel("Hilton Toronto",                  4,"Toronto",     "hilton+toronto",                     "~4 km del BMO Field")));
        HOTELES.put("MEX", List.of(
            hotel("Camino Real Estadio Azteca",      4,"CDMX",        "camino+real+estadio+azteca",         "~1 km del Estadio Azteca"),
            hotel("Marriott Mexico City Pedregal",   4,"CDMX",        "marriott+mexico+city+pedregal",      "~4 km del Estadio Azteca"),
            hotel("Hilton Mexico City Reforma",      5,"CDMX",        "hilton+mexico+city+reforma",         "~8 km del Estadio Azteca"),
            hotel("JW Marriott Mexico City",         5,"CDMX",        "jw+marriott+mexico+city",            "~12 km del Estadio Azteca")));
        HOTELES.put("MTY", List.of(
            hotel("Courtyard Monterrey San Jerónimo",3,"Monterrey",   "courtyard+monterrey",                "~3 km del Estadio BBVA"),
            hotel("NH Collection Monterrey",         4,"San Pedro",   "nh+collection+monterrey",            "~5 km del Estadio BBVA"),
            hotel("Hilton Garden Inn Monterrey",     3,"Monterrey",   "hilton+garden+inn+monterrey",        "~8 km del Estadio BBVA"),
            hotel("Marriott Monterrey",              5,"Monterrey",   "marriott+monterrey",                 "~10 km del Estadio BBVA")));
        HOTELES.put("GDL", List.of(
            hotel("Hilton Guadalajara Midtown",      4,"Guadalajara", "hilton+guadalajara+midtown",         "~6 km del Estadio Akron"),
            hotel("Camino Real Guadalajara",         4,"Guadalajara", "camino+real+guadalajara",            "~7 km del Estadio Akron"),
            hotel("Marriott Guadalajara",            5,"Guadalajara", "marriott+guadalajara",               "~8 km del Estadio Akron"),
            hotel("Hotel Dann Carlton Guadalajara",  4,"Guadalajara", "dann+carlton+guadalajara",           "~10 km del Estadio Akron")));
    }

    // ─── Atracciones curadas (fallback si Overpass falla) ────────────────────

    private static final Map<String, List<AtraccionDto>> ATRACCIONES_CURADAS = new HashMap<>();
    static {
        ATRACCIONES_CURADAS.put("NYC", List.of(
            atraccion("Times Square","ZONA TURÍSTICA","🌆","El corazón palpitante de Manhattan con sus pantallas LED y ambiente vibrante.","https://maps.google.com/?q=Times+Square+New+York"),
            atraccion("Estatua de la Libertad","MONUMENTO","🗽","Símbolo icónico de libertad. Ferry desde Battery Park.","https://maps.google.com/?q=Statue+of+Liberty+New+York"),
            atraccion("Central Park","PARQUE","🌳","843 acres de naturaleza en el corazón de Manhattan.","https://maps.google.com/?q=Central+Park+New+York"),
            atraccion("Museo de Historia Natural","MUSEO","🏛️","Dinosaurios, astronomía y culturas del mundo.","https://maps.google.com/?q=American+Museum+Natural+History+New+York")));
        ATRACCIONES_CURADAS.put("LAX", List.of(
            atraccion("Hollywood Walk of Fame","CULTURA","⭐","Más de 2.600 estrellas de celebridades en el suelo.","https://maps.google.com/?q=Hollywood+Walk+of+Fame"),
            atraccion("Santa Monica Pier","ENTRETENIMIENTO","🎡","Muelle icónico con parque de diversiones y vistas al Pacífico.","https://maps.google.com/?q=Santa+Monica+Pier"),
            atraccion("Griffith Observatory","CIENCIA","🔭","Planetario con vistas panorámicas y el letrero de Hollywood.","https://maps.google.com/?q=Griffith+Observatory+Los+Angeles"),
            atraccion("Getty Center","ARTE","🎨","Museo de arte con arquitectura impresionante y vistas de 360°.","https://maps.google.com/?q=Getty+Center+Los+Angeles")));
        ATRACCIONES_CURADAS.put("DFW", List.of(
            atraccion("The Sixth Floor Museum","MUSEO","🏛️","Museo sobre el asesinato de JFK en el edificio histórico.","https://maps.google.com/?q=Sixth+Floor+Museum+Dallas"),
            atraccion("Deep Ellum","ENTRETENIMIENTO","🎵","Barrio bohemio con arte callejero, música en vivo y restaurantes.","https://maps.google.com/?q=Deep+Ellum+Dallas"),
            atraccion("Reunion Tower","MONUMENTO","🗼","Torre icónica de Dallas con restaurante giratorio y vistas de 360°.","https://maps.google.com/?q=Reunion+Tower+Dallas")));
        ATRACCIONES_CURADAS.put("SFO", List.of(
            atraccion("Golden Gate Bridge","MONUMENTO","🌉","El puente suspendido más famoso del mundo.","https://maps.google.com/?q=Golden+Gate+Bridge"),
            atraccion("Alcatraz","MUSEO","🏝️","La mítica penitenciaría federal en isla, ahora museo histórico.","https://maps.google.com/?q=Alcatraz+San+Francisco"),
            atraccion("Fisherman's Wharf","GASTRONOMÍA","🦀","Puerto histórico con mariscos frescos y el famoso pan sourdough.","https://maps.google.com/?q=Fishermans+Wharf+San+Francisco")));
        ATRACCIONES_CURADAS.put("MCI", List.of(
            atraccion("National WWI Museum","MUSEO","🏛️","El mejor museo del mundo dedicado a la Primera Guerra Mundial.","https://maps.google.com/?q=National+WWI+Museum+Kansas+City"),
            atraccion("Country Club Plaza","ZONA TURÍSTICA","🛍️","Distrito de compras con arquitectura española y fuentes.","https://maps.google.com/?q=Country+Club+Plaza+Kansas+City"),
            atraccion("Nelson-Atkins Museum","ARTE","🎨","Museo de arte de clase mundial con colección asiática excepcional.","https://maps.google.com/?q=Nelson+Atkins+Museum+Kansas+City")));
        ATRACCIONES_CURADAS.put("IAH", List.of(
            atraccion("NASA Space Center","CIENCIA","🚀","Centro espacial de la NASA con misiones reales y astronautas.","https://maps.google.com/?q=Space+Center+Houston"),
            atraccion("Museum District Houston","CULTURA","🎨","19 museos y galerías de clase mundial en una sola zona.","https://maps.google.com/?q=Museum+District+Houston"),
            atraccion("Houston Zoo","NATURALEZA","🦒","Uno de los zoológicos más visitados de USA con 6.000 animales.","https://maps.google.com/?q=Houston+Zoo")));
        ATRACCIONES_CURADAS.put("BOS", List.of(
            atraccion("Freedom Trail","HISTORIA","🏛️","Ruta histórica de 4 km por 16 sitios de la Revolución Americana.","https://maps.google.com/?q=Freedom+Trail+Boston"),
            atraccion("Fenway Park","DEPORTE","⚾","El estadio de béisbol más antiguo de USA, hogar de los Red Sox.","https://maps.google.com/?q=Fenway+Park+Boston"),
            atraccion("Harvard University","ACADEMIA","🎓","La universidad más antigua de América con campus histórico visitable.","https://maps.google.com/?q=Harvard+University+Cambridge")));
        ATRACCIONES_CURADAS.put("PHL", List.of(
            atraccion("Liberty Bell","MONUMENTO","🔔","La campana que proclamó la independencia de los Estados Unidos.","https://maps.google.com/?q=Liberty+Bell+Philadelphia"),
            atraccion("Rocky Steps - Art Museum","CULTURA","🏃","Los famosos escalones inmortalizados por la película Rocky.","https://maps.google.com/?q=Philadelphia+Museum+of+Art"),
            atraccion("Reading Terminal Market","GASTRONOMÍA","🥐","Mercado histórico desde 1893 con el mejor cheesesteak de la ciudad.","https://maps.google.com/?q=Reading+Terminal+Market+Philadelphia")));
        ATRACCIONES_CURADAS.put("MIA", List.of(
            atraccion("South Beach","PLAYA","🏖️","La playa más famosa de Miami con Art Deco, vida nocturna y arena blanca.","https://maps.google.com/?q=South+Beach+Miami"),
            atraccion("Wynwood Walls","ARTE","🎨","Barrio de street art con murales de artistas internacionales.","https://maps.google.com/?q=Wynwood+Walls+Miami"),
            atraccion("Vizcaya Museum & Gardens","PATRIMONIO","🏰","Villa italiana del siglo XX con jardines frente a la bahía de Biscayne.","https://maps.google.com/?q=Vizcaya+Museum+Miami")));
        ATRACCIONES_CURADAS.put("ATL", List.of(
            atraccion("Georgia Aquarium","ACUARIO","🐠","Uno de los acuarios más grandes del mundo, ideal para una visita en familia.","https://maps.google.com/?q=Georgia+Aquarium+Atlanta"),
            atraccion("Centennial Olympic Park","PARQUE","🌳","Parque icónico en el centro de Atlanta, creado para los Juegos Olímpicos de 1996.","https://maps.google.com/?q=Centennial+Olympic+Park+Atlanta"),
            atraccion("World of Coca-Cola","MUSEO","🥤","Experiencia interactiva sobre la historia de Coca-Cola en Atlanta.","https://maps.google.com/?q=World+of+Coca-Cola+Atlanta"),
            atraccion("Martin Luther King Jr. National Historical Park","HISTORIA","🏛️","Sitio histórico dedicado a la vida y legado de Martin Luther King Jr.","https://maps.google.com/?q=Martin+Luther+King+Jr+National+Historical+Park")));
        ATRACCIONES_CURADAS.put("SEA", List.of(
            atraccion("Space Needle","MONUMENTO","🗼","Torre icónica de 184m con restaurante giratorio y vistas a los volcanes.","https://maps.google.com/?q=Space+Needle+Seattle"),
            atraccion("Pike Place Market","MERCADO","🐟","El mercado de pescado más famoso del mundo, abierto desde 1907.","https://maps.google.com/?q=Pike+Place+Market+Seattle"),
            atraccion("Chihuly Garden and Glass","ARTE","🔮","Increíbles esculturas de vidrio soplado del artista Dale Chihuly.","https://maps.google.com/?q=Chihuly+Garden+Glass+Seattle")));
        ATRACCIONES_CURADAS.put("YVR", List.of(
            atraccion("Stanley Park","PARQUE","🌲","Parque de 400 ha con bosque, playa y vistas a las montañas nevadas.","https://maps.google.com/?q=Stanley+Park+Vancouver"),
            atraccion("Granville Island","CULTURA","🎭","Isla cultural con mercado de productores y estudios de artistas.","https://maps.google.com/?q=Granville+Island+Vancouver"),
            atraccion("Capilano Suspension Bridge","AVENTURA","🌉","Puente colgante sobre el cañón del río Capilano a 70m de altura.","https://maps.google.com/?q=Capilano+Suspension+Bridge+Vancouver")));
        ATRACCIONES_CURADAS.put("YTO", List.of(
            atraccion("CN Tower","MONUMENTO","🗼","La torre más alta del hemisferio occidental con paseo de cristal.","https://maps.google.com/?q=CN+Tower+Toronto"),
            atraccion("Distillery District","CULTURA","🏭","Barrio victoriano restaurado con galerías, cafés y teatros.","https://maps.google.com/?q=Distillery+District+Toronto"),
            atraccion("Toronto Islands","NATURALEZA","🏝️","Archipiélago frente al skyline con playas y alquiler de bicicletas.","https://maps.google.com/?q=Toronto+Islands")));
        ATRACCIONES_CURADAS.put("MEX", List.of(
            atraccion("Teotihuacán","ARQUEOLOGÍA","🏛️","Las pirámides más grandes de México, a 50 km de CDMX.","https://maps.google.com/?q=Teotihuacan+Mexico"),
            atraccion("Zócalo","HISTORIA","🏰","La plaza principal rodeada de la Catedral y el Palacio Nacional.","https://maps.google.com/?q=Zocalo+Ciudad+de+Mexico"),
            atraccion("Xochimilco","NATURALEZA","🛶","Canales prehispánicos con trajineras de colores y música.","https://maps.google.com/?q=Xochimilco+Mexico"),
            atraccion("Museo de Antropología","MUSEO","🏺","El mejor museo de culturas prehispánicas del mundo, Patrimonio UNESCO.","https://maps.google.com/?q=Museo+Nacional+Antropologia+Mexico")));
        ATRACCIONES_CURADAS.put("MTY", List.of(
            atraccion("Cerro de la Silla","NATURALEZA","⛰️","El cerro emblemático de Monterrey con forma de silla de montar.","https://maps.google.com/?q=Cerro+de+la+Silla+Monterrey"),
            atraccion("Barrio Antiguo","CULTURA","🎶","El barrio más bohemio con bares, galerías y vida nocturna.","https://maps.google.com/?q=Barrio+Antiguo+Monterrey"),
            atraccion("Parque Fundidora","PARQUE","🏭","Parque urbano sobre una antigua fundidora con museos y actividades.","https://maps.google.com/?q=Parque+Fundidora+Monterrey")));
        ATRACCIONES_CURADAS.put("GDL", List.of(
            atraccion("Tlaquepaque","ARTESANÍA","🎪","Pueblo mágico de artesanías, tequila, mariachi y arquitectura colonial.","https://maps.google.com/?q=Tlaquepaque+Guadalajara"),
            atraccion("Hospicio Cabañas","PATRIMONIO","🎨","Patrimonio UNESCO con los murales de José Clemente Orozco.","https://maps.google.com/?q=Hospicio+Cabanas+Guadalajara"),
            atraccion("Lago de Chapala","NATURALEZA","🏞️","El lago más grande de México con vistas espectaculares.","https://maps.google.com/?q=Lago+de+Chapala+Jalisco")));
    }

    // ─── OpenTripMap — atracciones con API key ───────────────────────────────

    @SuppressWarnings({"unchecked","rawtypes"})
    private List<AtraccionDto> fetchAtraccionesOTM(double lat, double lon) {
        if ("SIN_CONFIGURAR".equals(otmKey)) return Collections.emptyList();
        try {
            String url = "https://api.opentripmap.com/0.1/en/places/radius"
                    + "?radius=8000&lon={lon}&lat={lat}"
                    + "&format=json&kinds=interesting_places"
                    + "&rate=2&limit=8&apikey={key}";

            List<Map> places = restTemplate.getForObject(url, List.class, lon, lat, otmKey);
            if (places == null || places.isEmpty()) return Collections.emptyList();

            List<AtraccionDto> result = new ArrayList<>();
            for (Map p : places) {
                String nombre = (String) p.get("name");
                if (nombre == null || nombre.isBlank()) continue;
                String kinds = String.valueOf(p.getOrDefault("kinds", ""));
                Map point = (Map) p.getOrDefault("point", Map.of());
                double pLat = point.containsKey("lat") ? ((Number) point.get("lat")).doubleValue() : lat;
                double pLon = point.containsKey("lon") ? ((Number) point.get("lon")).doubleValue() : lon;

                result.add(AtraccionDto.builder()
                        .nombre(nombre)
                        .tipo(tipoOTM(kinds))
                        .emoji(emojiOTM(kinds))
                        .descripcion(descOTM(kinds, nombre))
                        .mapsUrl("https://maps.google.com/?q=" + pLat + "," + pLon)
                        .build());
            }
            log.info("✅ OpenTripMap: {} atracciones para ({},{})", result.size(), lat, lon);
            return result;
        } catch (Exception e) {
            log.warn("⚠️ OpenTripMap error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private static String tipoOTM(String kinds) {
        if (kinds.contains("museum"))        return "MUSEO";
        if (kinds.contains("gallery"))       return "GALERÍA";
        if (kinds.contains("viewpoint"))     return "MIRADOR";
        if (kinds.contains("theme_park"))    return "PARQUE TEMÁTICO";
        if (kinds.contains("artwork"))       return "ARTE";
        if (kinds.contains("monument"))      return "MONUMENTO";
        if (kinds.contains("memorial"))      return "MEMORIAL";
        if (kinds.contains("historic"))      return "HISTORIA";
        if (kinds.contains("natural"))       return "NATURALEZA";
        if (kinds.contains("park"))          return "PARQUE";
        if (kinds.contains("cultural"))      return "CULTURA";
        if (kinds.contains("amusement"))     return "ENTRETENIMIENTO";
        return "ATRACCIÓN";
    }

    private static String emojiOTM(String kinds) {
        if (kinds.contains("museum"))        return "🏛️";
        if (kinds.contains("gallery"))       return "🎨";
        if (kinds.contains("viewpoint"))     return "🔭";
        if (kinds.contains("theme_park"))    return "🎡";
        if (kinds.contains("artwork"))       return "🖼️";
        if (kinds.contains("monument"))      return "🗿";
        if (kinds.contains("memorial"))      return "🕊️";
        if (kinds.contains("historic"))      return "🏰";
        if (kinds.contains("natural"))       return "🌿";
        if (kinds.contains("park"))          return "🌳";
        if (kinds.contains("amusement"))     return "🎡";
        if (kinds.contains("cultural"))      return "🎭";
        return "📍";
    }

    private static String descOTM(String kinds, String nombre) {
        if (kinds.contains("museum"))     return nombre + " — museo de interés en la ciudad sede del Mundial 2026.";
        if (kinds.contains("gallery"))    return nombre + " — galería de arte recomendada durante tu visita.";
        if (kinds.contains("viewpoint"))  return nombre + " — mirador con vistas panorámicas de la ciudad.";
        if (kinds.contains("theme_park")) return nombre + " — parque temático de entretenimiento.";
        if (kinds.contains("monument"))   return nombre + " — monumento histórico emblemático de la ciudad.";
        if (kinds.contains("historic"))   return nombre + " — sitio histórico de importancia cultural.";
        if (kinds.contains("natural"))    return nombre + " — espacio natural destacado para visitar.";
        if (kinds.contains("park"))       return nombre + " — parque recomendado para disfrutar durante el torneo.";
        return nombre + " — lugar de interés turístico de la ciudad sede del Mundial 2026.";
    }

    // ─── Overpass API — atracciones dinámicas sin API key ────────────────────

    @SuppressWarnings({"unchecked","rawtypes"})
    private List<AtraccionDto> fetchAtraccionesOverpass(double lat, double lon) {
        try {
            // Consulta QL: atracciones turísticas e históricas en radio de 6 km
            String query = "[out:json][timeout:20];"
                    + "(node[\"tourism\"~\"^(attraction|museum|gallery|viewpoint|theme_park|artwork)$\"]"
                    + "(around:6000," + lat + "," + lon + ");"
                    + "node[\"historic\"~\"^(monument|memorial|castle|ruins|archaeological_site)$\"]"
                    + "(around:6000," + lat + "," + lon + "););"
                    + "out body 8;";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String body = "data=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
            HttpEntity<String> request = new HttpEntity<>(body, headers);

            Map response = restTemplate.postForObject(overpassUrl, request, Map.class);
            if (response == null) return Collections.emptyList();

            List<Map> elements = (List<Map>) response.getOrDefault("elements", List.of());
            List<AtraccionDto> result = new ArrayList<>();

            for (Map el : elements) {
                Map tags = (Map) el.getOrDefault("tags", Map.of());
                String nombre = (String) tags.get("name");
                if (nombre == null || nombre.isBlank()) continue;

                double eLat = el.containsKey("lat") ? ((Number) el.get("lat")).doubleValue() : lat;
                double eLon = el.containsKey("lon") ? ((Number) el.get("lon")).doubleValue() : lon;
                String tourism  = String.valueOf(tags.getOrDefault("tourism", ""));
                String historic = String.valueOf(tags.getOrDefault("historic", ""));
                String website  = (String) tags.getOrDefault("website", "");

                String mapsUrl = website.startsWith("http")
                        ? website
                        : "https://maps.google.com/?q=" + eLat + "," + eLon;

                result.add(AtraccionDto.builder()
                        .nombre(nombre)
                        .tipo(tipoOSM(tourism, historic))
                        .emoji(emojiOSM(tourism, historic))
                        .descripcion(descOSM(tourism, historic, nombre))
                        .mapsUrl(mapsUrl)
                        .build());

                if (result.size() >= 6) break;
            }
            log.info("✅ Overpass: {} atracciones obtenidas para ({},{})", result.size(), lat, lon);
            return result;
        } catch (Exception e) {
            log.warn("⚠️ Overpass API error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    // ─── Método principal ────────────────────────────────────────────────────

    public TravelSuggestionsDto getSugerencias(String estadioNombre) {
        Map.Entry<String, CiudadInfo> match = ESTADIO_INFO.entrySet().stream()
                .filter(e -> estadioNombre.toLowerCase().contains(e.getKey().toLowerCase())
                          || e.getKey().toLowerCase().contains(estadioNombre.toLowerCase()))
                .findFirst().orElse(null);

        String estadioDisplay = match != null ? match.getKey() : estadioNombre;
        CiudadInfo info = match != null ? match.getValue()
                : new CiudadInfo("Nueva York","US","NYC","New+York",40.7128,-74.0060);

        List<HotelSuggestionDto> hoteles = HOTELES.getOrDefault(info.iata(),
                hotelesFallback(info.ciudad(), estadioDisplay));

        // Triple fallback: OTM → Overpass → curadas
        List<AtraccionDto> atracciones = fetchAtraccionesOTM(info.lat(), info.lon());
        if (atracciones.isEmpty()) atracciones = fetchAtraccionesOverpass(info.lat(), info.lon());
        boolean apiViva = !atracciones.isEmpty();
        if (!apiViva) atracciones = ATRACCIONES_CURADAS.getOrDefault(info.iata(), List.of());

        String ciudadEnc = enc(info.ciudad());
        return TravelSuggestionsDto.builder()
                .estadio(estadioDisplay)
                .ciudad(info.ciudad())
                .pais(info.pais())
                .iataCode(info.iata())
                .googleFlightsUrl("https://www.google.com/travel/flights?q=vuelos+a+" + info.urlSlug() + "+junio+2026")
                .skyscannerUrl("https://www.skyscanner.com/transport/flights/bog/" + info.iata().toLowerCase() + "/260611/")
                .bookingCiudadUrl("https://www.booking.com/searchresults.html?ss=" + ciudadEnc
                        + "&checkin_year=2026&checkin_month=6&checkin_monthday=11"
                        + "&checkout_year=2026&checkout_month=6&checkout_monthday=14"
                        + "&group_adults=2&no_rooms=1")
                .hoteles(hoteles)
                .atracciones(atracciones)
                .apiFuncional(apiViva)
                .build();
    }

    // ─── Helpers OSM ─────────────────────────────────────────────────────────

    private static String tipoOSM(String tourism, String historic) {
        return switch (tourism) {
            case "museum"      -> "MUSEO";
            case "gallery"     -> "GALERÍA";
            case "attraction"  -> "ATRACCIÓN";
            case "viewpoint"   -> "MIRADOR";
            case "theme_park"  -> "PARQUE TEMÁTICO";
            case "artwork"     -> "ARTE";
            default -> switch (historic) {
                case "monument"            -> "MONUMENTO";
                case "memorial"            -> "MEMORIAL";
                case "castle"              -> "CASTILLO";
                case "archaeological_site" -> "ARQUEOLOGÍA";
                case "ruins"               -> "RUINAS";
                default                    -> "LUGAR DE INTERÉS";
            };
        };
    }

    private static String emojiOSM(String tourism, String historic) {
        return switch (tourism) {
            case "museum"     -> "🏛️";
            case "gallery"    -> "🎨";
            case "viewpoint"  -> "🔭";
            case "theme_park" -> "🎡";
            case "artwork"    -> "🖼️";
            default -> switch (historic) {
                case "monument","memorial"         -> "🗿";
                case "castle"                      -> "🏰";
                case "archaeological_site","ruins"  -> "🏺";
                default                            -> "📍";
            };
        };
    }

    private static String descOSM(String tourism, String historic, String nombre) {
        return switch (tourism) {
            case "museum"      -> nombre + " — museo de interés en la ciudad sede del Mundial 2026.";
            case "gallery"     -> nombre + " — galería de arte recomendada durante tu visita.";
            case "attraction"  -> nombre + " — atracción turística destacada de la ciudad.";
            case "viewpoint"   -> nombre + " — mirador con vistas panorámicas de la ciudad.";
            case "theme_park"  -> nombre + " — parque temático de entretenimiento.";
            case "artwork"     -> nombre + " — obra de arte o instalación cultural.";
            default -> switch (historic) {
                case "monument"            -> nombre + " — monumento histórico de la ciudad.";
                case "memorial"            -> nombre + " — memorial de importancia histórica.";
                case "castle"              -> nombre + " — castillo o fortaleza histórica.";
                case "archaeological_site" -> nombre + " — sitio arqueológico de relevancia.";
                default                    -> nombre + " — lugar de interés turístico de la ciudad sede.";
            };
        };
    }

    // ─── Builders de conveniencia ────────────────────────────────────────────

    private List<HotelSuggestionDto> hotelesFallback(String ciudad, String estadio) {
        String base = "https://www.booking.com/searchresults.html?ss=" + enc(ciudad)
                + "&checkin_year=2026&checkin_month=6&checkin_monthday=11"
                + "&checkout_year=2026&checkout_month=6&checkout_monthday=14"
                + "&group_adults=2&no_rooms=1";
        return List.of(
            HotelSuggestionDto.builder().nombre("Marriott " + ciudad).estrellas(5)
                .ciudad(ciudad).bookingUrl(base).distanciaEstadio("Cerca de " + estadio).disponible(true).build(),
            HotelSuggestionDto.builder().nombre("Hilton " + ciudad).estrellas(4)
                .ciudad(ciudad).bookingUrl(base).distanciaEstadio("Cerca de " + estadio).disponible(true).build(),
            HotelSuggestionDto.builder().nombre("Holiday Inn " + ciudad).estrellas(3)
                .ciudad(ciudad).bookingUrl(base).distanciaEstadio("Cerca de " + estadio).disponible(true).build());
    }

    private static HotelSuggestionDto hotel(String nombre, int estrellas, String ciudad,
                                             String slug, String distancia) {
        String url = "https://www.booking.com/search.html?ss=" + slug
                + "&checkin_year=2026&checkin_month=6&checkin_monthday=11"
                + "&checkout_year=2026&checkout_month=6&checkout_monthday=14"
                + "&group_adults=2&no_rooms=1";
        return HotelSuggestionDto.builder().nombre(nombre).estrellas(estrellas).ciudad(ciudad)
                .bookingUrl(url).distanciaEstadio(distancia).disponible(true).build();
    }

    private static AtraccionDto atraccion(String nombre, String tipo, String emoji,
                                           String desc, String maps) {
        return AtraccionDto.builder().nombre(nombre).tipo(tipo).emoji(emoji)
                .descripcion(desc).mapsUrl(maps).build();
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private record CiudadInfo(String ciudad, String pais, String iata,
                               String urlSlug, double lat, double lon) {}
}
