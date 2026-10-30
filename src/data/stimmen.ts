/**
 * Kundenstimmen — wörtlich von der bisherigen Website („Das sagen unsere
 * Kunden", quelle/alte-seite/texte.md). `auszug` ist ein wörtlicher Satz aus
 * dem Brief, `absaetze` der vollständige Text. Nichts umformuliert.
 */
import type { ImageMetadata } from 'astro';
import { ALTE_BILDER } from './bilder';

export interface Stimme {
  auszug: string;
  absaetze: string[];
  name: string;
  zusatz?: string;
  link?: { href: string; text: string };
  logo?: ImageMetadata;
  logoAlt?: string;
}

export const STIMMEN: Stimme[] = [
  {
    auszug:
      'Die MS Wohldorf ist für meine Workshops der ideale Ort, da das Schiff geschützte Räumlichkeiten für die Seewasser Filtrationsarbeiten, die Versammlung ganzer Klassen und auch Bereiche für Gruppenarbeit bietet.',
    absaetze: [
      'Lieber Uli,',
      'nun hab ich meinen Workshop „Plastikflut in der Elbe“ bereits zum vierten Male an Bord der MS Wohldorf in Deinen Räumlichkeiten geben dürfen. Damit haben sich in diesem Jahr im Rahmen der Hamburger Bildungswoche 92 Schülerinnen und Schüler mit dem Thema „Mikroplastik in der Elbe und im täglichen Umgang“ auseinandergesetzt.',
      'Seit Beginn dieses Bildungsangebotes sind die von One Earth – One Ocean e.V. (oeoo) angebotenen Workshops eines der Highlights im Programm von Wetter.Wasser.Waterkant, der Hamburger Bildungswoche. Bei der Anmeldung sind die Plätze für die Workshops binnen kürzester Zeit ausgebucht und von der Nachfrage her mehrfach überbucht. Die Kombination aus der Besonderheit des Lernortes an Bord der MS Wohldorf und den hands on Workshop-Inhalten machen gemeinsam den Erfolg dieser Veranstaltung aus.',
      'Dabei ist die 1959 gebaute ehemalige HADAG Hafenfähre eines der letzten sichtbaren Zeitzeugnisse dieses Schiffstyps aus dem aufstrebenden Hamburg zu Zeiten der Wirtschaftswunderjahre und stellt damit im Hamburger Traditionshafen einen markanten Punkt dieser Epoche dar.',
      'Die MS Wohldorf ist für meine Workshops der ideale Ort, da das Schiff geschützte Räumlichkeiten für die Seewasser Filtrationsarbeiten, die Versammlung ganzer Klassen und auch Bereiche für Gruppenarbeit bietet.',
      'Daher möchte ich Dir, lieber Uli, für Dein Engagement für die Hamburger Bildungswoche und die Bereitstellung des Schiffes für die Workshops danken und möchte hier auch meine Hoffnung ausdrücken, dass auch in Zukunft dieser außergewöhnliche Lernort weiterhin genutzt werden kann.',
    ],
    name: 'Dr. Rüdiger Stöhr',
    zusatz: 'One Earth – One Ocean e.V.',
    link: { href: 'https://oneearth-oneocean.com/', text: 'oneearth-oneocean.com' },
    logo: ALTE_BILDER.logoOeoo,
    logoAlt: 'Logo One Earth – One Ocean',
  },
  {
    auszug:
      'Nochmals herzlichen Dank für Ihre Gastfreundschaft und Zusammenarbeit, die weit über das einfach Zurverfügung-Stellen der Räumlichkeit hinausgeht. Wir fühlen uns bei Ihnen sehr gut aufgehoben …',
    absaetze: [
      'Sehr geehrter Herr Ritter,',
      'wir bedanken uns ganz herzlich dafür, dass wir nun schon im vierten Jahr mit einem Herzstück unseres Bildungsprojekt "Wetter.Wasser.Waterkant" bei Ihnen auf der alten HADAG-Fähre Wohldorf zu Gast sein durften. Wie bereits jeweils in den letzten Septemberwochen der Jahre 2020, 2021 und 2022, so haben wir und der gemeinnützige Kieler Verein One Earth - One Ocean über eine Woche Ihre Gastfreundschaft und das spezielle Ambiente auf der Wohldorf sehr genossen und einen tollen äußeren Rahmen für die Mikroplastik-Analyse-Workshops und auch die "nebenan" stattfindenden Besichtigungen des Müllsammelschiffs "SeeKuh" bekommen.',
      'Wir freuen uns besonders, dass Sie uns als einem öffentlich geförderten Bildungsprojekt mit begrenztem Budget diese zu unserem Bildungsauftrag besonders gut passende Räumlichkeit zu einem Sonderpreis zur Verfügung stellen. Dies kommt unmittelbar vielen Hamburger Schulklassen zugute. Damit bringen Sie auch Ihre Verbundenheit mit dem Standort Traditionsschiffhafen im Sandtorhafen zum Ausdruck, denn Sie tragen zur Lebendigkeit des Ortes bei und haben allein in dieser letzten September-Woche des Jahres 2023 weit über 500 Hamburger Schüler:innen einen beeindruckenden und nachhaltigen Aufenthalt im Sandtorhafen ermöglicht - die junge Generation hatte einen tollen Anlass, diesen schönen maritimen Ort zu entdecken.',
      'Nochmals herzlichen Dank für Ihre Gastfreundschaft und Zusammenarbeit, die weit über das einfach Zurverfügung-Stellen der Räumlichkeit hinausgeht. Wir fühlen uns bei Ihnen sehr gut aufgehoben und bedanken uns ausdrücklich auch für Ihr finanzielles Entgegenkommen, ohne das ein Zustandekommen dieses Bildungs-Events nicht möglich wäre. Wir wissen dies sehr zu schätzen, erwarten wie in jedem Jahr Ihre Rechnung an den Verein Klimabotschafter und freuen uns bereits auf unsere nächste gemeinsame Bildungswoche Wetter.Wasser.Waterkant.2024 in der letzten September-Woche im Jahr 2024.',
      'Ich freue mich über unsere Kooperation und bin sehr zuversichtlich, dass wir diese im Jahr 2024 fortsetzen können.',
    ],
    name: 'Jürgen Becker',
    zusatz: 'Netzwerkmanager KLIMA · Organisation der Wetter.Wasser.Waterkant.2023',
    link: { href: 'https://www2023.de/', text: 'www2023.de' },
    logo: ALTE_BILDER.logoWww,
    logoAlt: 'Logo Wetter.Wasser.Waterkant.2023',
  },
];
