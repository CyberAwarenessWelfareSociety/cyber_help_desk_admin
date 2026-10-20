const ISO_COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`;

const fallbackNames = {
  AE: 'United Arab Emirates', AU: 'Australia', BR: 'Brazil', CA: 'Canada', CN: 'China',
  DE: 'Germany', ES: 'Spain', FR: 'France', GB: 'United Kingdom', ID: 'Indonesia',
  IN: 'India', IT: 'Italy', JP: 'Japan', MX: 'Mexico', MY: 'Malaysia', NG: 'Nigeria',
  NP: 'Nepal', NZ: 'New Zealand', PH: 'Philippines', PK: 'Pakistan', RU: 'Russia',
  SA: 'Saudi Arabia', SG: 'Singapore', TH: 'Thailand', US: 'United States', ZA: 'South Africa',
};

const displayNames = typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

export const BANNER_COUNTRIES = ISO_COUNTRY_CODES.split(' ')
  .map((code) => ({ code, name: displayNames?.of(code) || fallbackNames[code] || code }))
  .sort((left, right) => left.name.localeCompare(right.name));

export function countryLabel(code) {
  if (!code) return 'Global — all countries';
  const match = BANNER_COUNTRIES.find((country) => country.code === code);
  return match ? `${match.name} (${match.code})` : code;
}
