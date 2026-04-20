export const getPlanetIconPath = (planetName) => {
    if (!planetName) return '';
    const name = planetName.toLowerCase();
    const ext = ['barren', 'storm', 'temperate'].includes(name) ? 'jpg' : 'png';
    return `/planet_icons/${name}.${ext}`;
};
