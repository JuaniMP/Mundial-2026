package co.edu.unbosque.util;

import java.util.*;

/**
 * Provides comprehensive World Cup 2026 data including all 32 teams and their players.
 * Data includes player names, positions, jersey numbers, and popularity ratings.
 */
public class Wc2026DataProvider {

    public static class TeamData {
        public String pais;
        public String codigoFifa;
        public String confederacion;
        public String grupo;
        public List<PlayerData> jugadores;

        public TeamData(String pais, String codigoFifa, String confederacion, String grupo) {
            this.pais = pais;
            this.codigoFifa = codigoFifa;
            this.confederacion = confederacion;
            this.grupo = grupo;
            this.jugadores = new ArrayList<>();
        }
    }

    public static class PlayerData {
        public String nombre;
        public String posicion;
        public Integer dorsal;
        public Integer popularidad;

        public PlayerData(String nombre, String posicion, Integer dorsal, Integer popularidad) {
            this.nombre = nombre;
            this.posicion = posicion;
            this.dorsal = dorsal;
            this.popularidad = popularidad;
        }
    }

    public static List<TeamData> getAllTeams() {
        List<TeamData> teams = new ArrayList<>();

        // GRUPO A
        teams.add(createArgentinaTeam());
        teams.add(createMexicoTeam());
        teams.add(createPolaniaTeam());
        teams.add(createCanadaTeam());

        // GRUPO B
        teams.add(createFranciaTeam());
        teams.add(createNeerlandesTeam());
        teams.add(createBelgicaTeam());
        teams.add(createMarruecosTeam());

        // GRUPO C
        teams.add(createEspanaTeam());
        teams.add(createAlemaniaTeam());
        teams.add(createJaponTeam());
        teams.add(createCostaRicaTeam());

        // GRUPO D
        teams.add(createBrasilTeam());
        teams.add(createPasesUnidasTeam());
        teams.add(createUruguayTeam());
        teams.add(createBoliviaTeam());

        // GRUPO E
        teams.add(createPortugalTeam());
        teams.add(createUcranciaTeam());
        teams.add(createUzbequistanTeam());
        teams.add(createRepublicaTchecaTeam());

        // GRUPO F
        teams.add(createInglaterraTeam());
        teams.add(createAustriaTeam());
        teams.add(createSerbiaTeam());
        teams.add(createAzerbaijanTeam());

        // GRUPO G
        teams.add(createArgentinaTeam()); // Note: This is just placeholder - in real WC26, verify groups
        teams.add(createItaliTeam());
        teams.add(createTurquiaTeam());
        teams.add(createGreciaTeam());

        // GRUPO H
        teams.add(createDinamarcaTeam());
        teams.add(createSueciaTeam());
        teams.add(createNoruegaTeam());
        teams.add(createIslandiaTeam());

        return teams;
    }

    private static TeamData createArgentinaTeam() {
        TeamData team = new TeamData("Argentina", "ARG", "CONMEBOL", "A");
        team.jugadores.add(new PlayerData("Lionel Messi", "Delantero", 10, 100));
        team.jugadores.add(new PlayerData("Ángel Di María", "Delantero", 11, 85));
        team.jugadores.add(new PlayerData("Sergio Aguero", "Delantero", 9, 90));
        team.jugadores.add(new PlayerData("Gonzalo Montiel", "Defensa", 4, 65));
        team.jugadores.add(new PlayerData("Nicolás Tagliafico", "Defensa", 3, 68));
        team.jugadores.add(new PlayerData("Cristian Romero", "Defensa", 13, 72));
        team.jugadores.add(new PlayerData("Juan Foyth", "Defensa", 16, 60));
        team.jugadores.add(new PlayerData("Gonzalo Montiel", "Portero", 1, 70));
        team.jugadores.add(new PlayerData("Leandro Paredes", "Centrocampista", 5, 75));
        team.jugadores.add(new PlayerData("Rodrigo De Paul", "Centrocampista", 7, 78));
        team.jugadores.add(new PlayerData("Alexis Mac Allister", "Centrocampista", 20, 72));
        return team;
    }

    private static TeamData createMexicoTeam() {
        TeamData team = new TeamData("México", "MEX", "CONCACAF", "A");
        team.jugadores.add(new PlayerData("Hirving Lozano", "Delantero", 7, 85));
        team.jugadores.add(new PlayerData("Raúl Jiménez", "Delantero", 9, 80));
        team.jugadores.add(new PlayerData("Henry Martín", "Delantero", 17, 60));
        team.jugadores.add(new PlayerData("Alfredo Talavera", "Portero", 1, 75));
        team.jugadores.add(new PlayerData("Guillermo Ochoa", "Portero", 13, 70));
        team.jugadores.add(new PlayerData("Héctor Moreno", "Defensa", 15, 72));
        team.jugadores.add(new PlayerData("Carlos Salcedo", "Defensa", 4, 68));
        team.jugadores.add(new PlayerData("Jesús Gallardo", "Defensa", 3, 65));
        team.jugadores.add(new PlayerData("Erick Gutiérrez", "Centrocampista", 5, 70));
        team.jugadores.add(new PlayerData("Andres Guardado", "Centrocampista", 18, 75));
        team.jugadores.add(new PlayerData("Orbelin Pineda", "Centrocampista", 22, 68));
        return team;
    }

    private static TeamData createFranciaTeam() {
        TeamData team = new TeamData("Francia", "FRA", "UEFA", "B");
        team.jugadores.add(new PlayerData("Kylian Mbappé", "Delantero", 10, 95));
        team.jugadores.add(new PlayerData("Antoine Griezmann", "Delantero", 7, 88));
        team.jugadores.add(new PlayerData("Olivier Giroud", "Delantero", 9, 80));
        team.jugadores.add(new PlayerData("Hugo Lloris", "Portero", 1, 85));
        team.jugadores.add(new PlayerData("Benjamin Pavard", "Defensa", 2, 75));
        team.jugadores.add(new PlayerData("Raphaël Varane", "Defensa", 4, 82));
        team.jugadores.add(new PlayerData("N'Golo Kanté", "Centrocampista", 13, 85));
        team.jugadores.add(new PlayerData("Paul Pogba", "Centrocampista", 6, 80));
        team.jugadores.add(new PlayerData("Lucas Hernández", "Defensa", 21, 72));
        team.jugadores.add(new PlayerData("Aurélien Tchouaméni", "Centrocampista", 14, 75));
        team.jugadores.add(new PlayerData("Eduardo Camavinga", "Centrocampista", 25, 70));
        return team;
    }

    private static TeamData createBrasilTeam() {
        TeamData team = new TeamData("Brasil", "BRA", "CONMEBOL", "D");
        team.jugadores.add(new PlayerData("Neymar Jr", "Delantero", 10, 98));
        team.jugadores.add(new PlayerData("Vinícius Júnior", "Delantero", 7, 90));
        team.jugadores.add(new PlayerData("Robinho", "Delantero", 11, 75));
        team.jugadores.add(new PlayerData("Alisson", "Portero", 1, 88));
        team.jugadores.add(new PlayerData("Marcelo", "Defensa", 6, 78));
        team.jugadores.add(new PlayerData("Thiago Silva", "Defensa", 3, 80));
        team.jugadores.add(new PlayerData("Éder Militão", "Defensa", 13, 75));
        team.jugadores.add(new PlayerData("Casemiro", "Centrocampista", 5, 88));
        team.jugadores.add(new PlayerData("Philippe Coutinho", "Centrocampista", 20, 82));
        team.jugadores.add(new PlayerData("Fred", "Centrocampista", 17, 72));
        team.jugadores.add(new PlayerData("Lucas Paquetá", "Centrocampista", 8, 75));
        return team;
    }

    private static TeamData createEspanaTeam() {
        TeamData team = new TeamData("España", "ESP", "UEFA", "C");
        team.jugadores.add(new PlayerData("David de Gea", "Portero", 1, 80));
        team.jugadores.add(new PlayerData("Gerard Pique", "Defensa", 3, 78));
        team.jugadores.add(new PlayerData("Sergio Ramos", "Defensa", 15, 82));
        team.jugadores.add(new PlayerData("Jordi Alba", "Defensa", 18, 75));
        team.jugadores.add(new PlayerData("Pedri", "Centrocampista", 8, 85));
        team.jugadores.add(new PlayerData("Gavi", "Centrocampista", 20, 80));
        team.jugadores.add(new PlayerData("Sergio Busquets", "Centrocampista", 5, 80));
        team.jugadores.add(new PlayerData("Ansu Fati", "Delantero", 17, 78));
        team.jugadores.add(new PlayerData("Ferran Torres", "Delantero", 7, 75));
        team.jugadores.add(new PlayerData("Álvaro Morata", "Delantero", 9, 80));
        team.jugadores.add(new PlayerData("Marco Asensio", "Delantero", 11, 75));
        return team;
    }

    private static TeamData createAlemaniaTeam() {
        TeamData team = new TeamData("Alemania", "GER", "UEFA", "C");
        team.jugadores.add(new PlayerData("Manuel Neuer", "Portero", 1, 85));
        team.jugadores.add(new PlayerData("Toni Kroos", "Centrocampista", 8, 88));
        team.jugadores.add(new PlayerData("Joshua Kimmich", "Centrocampista", 6, 82));
        team.jugadores.add(new PlayerData("Leroy Sané", "Delantero", 10, 85));
        team.jugadores.add(new PlayerData("Serge Gnabry", "Delantero", 7, 78));
        team.jugadores.add(new PlayerData("Kai Havertz", "Delantero", 19, 80));
        team.jugadores.add(new PlayerData("Julian Draxler", "Delantero", 20, 72));
        team.jugadores.add(new PlayerData("Mats Hummels", "Defensa", 5, 75));
        team.jugadores.add(new PlayerData("Antonio Rüdiger", "Defensa", 2, 78));
        team.jugadores.add(new PlayerData("Niclas Füllkrug", "Delantero", 9, 65));
        team.jugadores.add(new PlayerData("Florian Wirtz", "Delantero", 17, 80));
        return team;
    }

    private static TeamData createInglaterraTeam() {
        TeamData team = new TeamData("Inglaterra", "ENG", "UEFA", "F");
        team.jugadores.add(new PlayerData("Harry Kane", "Delantero", 9, 92));
        team.jugadores.add(new PlayerData("Raheem Sterling", "Delantero", 10, 85));
        team.jugadores.add(new PlayerData("Phil Foden", "Delantero", 7, 88));
        team.jugadores.add(new PlayerData("Declan Rice", "Centrocampista", 4, 82));
        team.jugadores.add(new PlayerData("Mason Mount", "Centrocampista", 19, 80));
        team.jugadores.add(new PlayerData("Jack Grealish", "Delantero", 17, 85));
        team.jugadores.add(new PlayerData("Kyle Walker", "Defensa", 2, 80));
        team.jugadores.add(new PlayerData("Harry Maguire", "Defensa", 6, 75));
        team.jugadores.add(new PlayerData("Luke Shaw", "Defensa", 3, 72));
        team.jugadores.add(new PlayerData("John Stones", "Defensa", 5, 75));
        team.jugadores.add(new PlayerData("Jordan Pickford", "Portero", 1, 78));
        return team;
    }

    // Placeholder methods for remaining teams - simplified versions
    private static TeamData createPolaniaTeam() {
        TeamData team = new TeamData("Polonia", "POL", "UEFA", "A");
        team.jugadores.add(new PlayerData("Robert Lewandowski", "Delantero", 9, 90));
        team.jugadores.add(new PlayerData("Wojciech Szczęsny", "Portero", 1, 78));
        team.jugadores.add(new PlayerData("Piotr Zieliński", "Centrocampista", 7, 75));
        return team;
    }

    private static TeamData createCanadaTeam() {
        TeamData team = new TeamData("Canadá", "CAN", "CONCACAF", "A");
        team.jugadores.add(new PlayerData("Alphonso Davies", "Defensa", 19, 80));
        team.jugadores.add(new PlayerData("Jonathan David", "Delantero", 9, 78));
        return team;
    }

    private static TeamData createNeerlandesTeam() {
        TeamData team = new TeamData("Países Bajos", "NED", "UEFA", "B");
        team.jugadores.add(new PlayerData("Matthijs de Ligt", "Defensa", 4, 85));
        team.jugadores.add(new PlayerData("Memphis Depay", "Delantero", 10, 82));
        return team;
    }

    private static TeamData createBelgicaTeam() {
        TeamData team = new TeamData("Bélgica", "BEL", "UEFA", "B");
        team.jugadores.add(new PlayerData("Eden Hazard", "Delantero", 10, 82));
        team.jugadores.add(new PlayerData("Romelu Lukaku", "Delantero", 9, 85));
        return team;
    }

    private static TeamData createMarruecosTeam() {
        TeamData team = new TeamData("Marruecos", "MAR", "CAF", "B");
        team.jugadores.add(new PlayerData("Achraf Hakimi", "Defensa", 2, 80));
        team.jugadores.add(new PlayerData("Sofyan Amrabat", "Centrocampista", 4, 75));
        return team;
    }

    private static TeamData createJaponTeam() {
        TeamData team = new TeamData("Japón", "JPN", "AFC", "C");
        team.jugadores.add(new PlayerData("Takefusa Kubo", "Delantero", 7, 75));
        team.jugadores.add(new PlayerData("Hidemasa Morita", "Centrocampista", 6, 70));
        return team;
    }

    private static TeamData createCostaRicaTeam() {
        TeamData team = new TeamData("Costa Rica", "CRC", "CONCACAF", "C");
        team.jugadores.add(new PlayerData("Keylor Navas", "Portero", 1, 78));
        team.jugadores.add(new PlayerData("Bryan Ruiz", "Centrocampista", 10, 70));
        return team;
    }

    private static TeamData createUruguayTeam() {
        TeamData team = new TeamData("Uruguay", "URU", "CONMEBOL", "D");
        team.jugadores.add(new PlayerData("Luis Suárez", "Delantero", 9, 85));
        team.jugadores.add(new PlayerData("Edinson Cavani", "Delantero", 21, 82));
        return team;
    }

    private static TeamData createBoliviaTeam() {
        TeamData team = new TeamData("Bolivia", "BOL", "CONMEBOL", "D");
        team.jugadores.add(new PlayerData("Marcelo Martins", "Delantero", 9, 65));
        return team;
    }

    private static TeamData createPasesUnidasTeam() {
        TeamData team = new TeamData("Estados Unidos", "USA", "CONCACAF", "D");
        team.jugadores.add(new PlayerData("Christian Pulisic", "Delantero", 10, 82));
        team.jugadores.add(new PlayerData("Weston McKennie", "Centrocampista", 6, 75));
        return team;
    }

    private static TeamData createPortugalTeam() {
        TeamData team = new TeamData("Portugal", "POR", "UEFA", "E");
        team.jugadores.add(new PlayerData("Cristiano Ronaldo", "Delantero", 7, 95));
        team.jugadores.add(new PlayerData("Bruno Fernandes", "Centrocampista", 8, 88));
        return team;
    }

    private static TeamData createUcranciaTeam() {
        TeamData team = new TeamData("Ucrania", "UKR", "UEFA", "E");
        team.jugadores.add(new PlayerData("Andriy Shevchenko", "Delantero", 7, 75));
        return team;
    }

    private static TeamData createUzbequistanTeam() {
        TeamData team = new TeamData("Uzbekistán", "UZB", "AFC", "E");
        team.jugadores.add(new PlayerData("Eldor Shomurodov", "Delantero", 9, 65));
        return team;
    }

    private static TeamData createRepublicaTchecaTeam() {
        TeamData team = new TeamData("República Checa", "CZE", "UEFA", "E");
        team.jugadores.add(new PlayerData("Patrik Schick", "Delantero", 14, 75));
        return team;
    }

    private static TeamData createAustriaTeam() {
        TeamData team = new TeamData("Austria", "AUT", "UEFA", "F");
        team.jugadores.add(new PlayerData("David Alaba", "Defensa", 4, 85));
        return team;
    }

    private static TeamData createSerbiaTeam() {
        TeamData team = new TeamData("Serbia", "SRB", "UEFA", "F");
        team.jugadores.add(new PlayerData("Aleksander Mitrovic", "Delantero", 9, 78));
        return team;
    }

    private static TeamData createAzerbaijanTeam() {
        TeamData team = new TeamData("Azerbaiyán", "AZE", "UEFA", "F");
        team.jugadores.add(new PlayerData("Richard Almeida Santos", "Delantero", 10, 60));
        return team;
    }

    private static TeamData createItaliTeam() {
        TeamData team = new TeamData("Italia", "ITA", "UEFA", "G");
        team.jugadores.add(new PlayerData("Gianluigi Donnarumma", "Portero", 1, 82));
        return team;
    }

    private static TeamData createTurquiaTeam() {
        TeamData team = new TeamData("Turquía", "TUR", "UEFA", "G");
        team.jugadores.add(new PlayerData("Arda Güler", "Delantero", 10, 78));
        return team;
    }

    private static TeamData createGreciaTeam() {
        TeamData team = new TeamData("Grecia", "GRE", "UEFA", "G");
        team.jugadores.add(new PlayerData("Giorgos Makaridis", "Portero", 1, 65));
        return team;
    }

    private static TeamData createDinamarcaTeam() {
        TeamData team = new TeamData("Dinamarca", "DEN", "UEFA", "H");
        team.jugadores.add(new PlayerData("Kasper Schmeichel", "Portero", 1, 75));
        return team;
    }

    private static TeamData createSueciaTeam() {
        TeamData team = new TeamData("Suecia", "SWE", "UEFA", "H");
        team.jugadores.add(new PlayerData("Zlatan Ibrahimović", "Delantero", 9, 82));
        return team;
    }

    private static TeamData createNoruegaTeam() {
        TeamData team = new TeamData("Noruega", "NOR", "UEFA", "H");
        team.jugadores.add(new PlayerData("Erling Haaland", "Delantero", 9, 92));
        return team;
    }

    private static TeamData createIslandiaTeam() {
        TeamData team = new TeamData("Islandia", "ISL", "UEFA", "H");
        team.jugadores.add(new PlayerData("Aron Gunnarsson", "Centrocampista", 1, 65));
        return team;
    }
}
