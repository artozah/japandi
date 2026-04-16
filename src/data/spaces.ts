import {
  CalendarHeart,
  CheckCircle,
  MapPin,
  Palette,
  Sparkles,
  Wand2,
} from 'lucide-react';
import type { AccordionGroup, NavId, NavItem } from '@/types/spaces';

export const navItems: NavItem[] = [
  {
    id: 'style',
    label: 'Style',
    description: 'Give your space a completely fresh view',
    icon: Sparkles,
  },
  {
    id: 'occasions',
    label: 'Occasions',
    description: 'Style your space to suit any occasion',
    icon: CalendarHeart,
  },
  {
    id: 'locations',
    label: 'Locations',
    description: 'Infuse your space with world inspiration',
    icon: MapPin,
  },
  {
    id: 'themes',
    label: 'Themes',
    description: 'Turn your space into an entire world of its own',
    icon: Palette,
  },
  {
    id: 'enhance',
    label: 'Enhance',
    description: 'The ideal finishing touch. For every visual',
    icon: Wand2,
  },
  {
    id: 'finalize',
    label: 'Finalize',
    description: 'Take full command of quality, camera, output',
    icon: CheckCircle,
  },
];

export const accordionData: Record<NavId, AccordionGroup[]> = {
  style: [
    {
      title: 'Modernist',
      items: [
        { image: '/images/Minimalist.webp', title: 'Minimalist' },
        { image: '/images/Scandinavian.webp', title: 'Scandinavian' },
        { image: '/images/Japandi.webp', title: 'Japandi' },
        { image: '/images/Bauhaus.webp', title: 'Bauhaus' },
        { image: '/images/Mid-Century.webp', title: 'Mid-Century' },
      ],
    },
    {
      title: 'Raw',
      items: [
        { image: '/images/Industrial.webp', title: 'Industrial' },
        { image: '/images/Loft.webp', title: 'Loft' },
        { image: '/images/Brutalist.webp', title: 'Brutalist' },
      ],
    },
    {
      title: 'Natural',
      items: [
        { image: '/images/Bohemian.webp', title: 'Bohemian' },
        { image: '/images/Rustic.webp', title: 'Rustic' },
        { image: '/images/Cottagecore.webp', title: 'Cottagecore' },
        { image: '/images/Coastal.webp', title: 'Coastal' },
        { image: '/images/Organic.webp', title: 'Organic' },
        { image: '/images/Zen.webp', title: 'Zen' },
        { image: '/images/Tropical.webp', title: 'Tropical' },
      ],
    },
    {
      title: 'Elegant',
      items: [
        { image: '/images/Classic.webp', title: 'Classic' },
        { image: '/images/ArtDeco.webp', title: 'Art Deco' },
        { image: '/images/Hollywood.webp', title: 'Hollywood' },
        { image: '/images/Luxury.webp', title: 'Luxury' },
        { image: '/images/Transitional.webp', title: 'Transitional' },
        { image: '/images/Colonial.webp', title: 'Colonial' },
      ],
    },
    {
      title: 'Creative',
      items: [
        { image: '/images/Eclectic.webp', title: 'Eclectic' },
        { image: '/images/Maximalist.webp', title: 'Maximalist' },
        { image: '/images/Vintage.webp', title: 'Vintage' },
      ],
    },
    {
      title: 'Coastal',
      items: [
        { image: '/images/Mediterranean.webp', title: 'Mediterranean' },
        { image: '/images/Greek.webp', title: 'Greek' },
        { image: '/images/Moroccan.webp', title: 'Moroccan' },
        { image: '/images/Andalusian.webp', title: 'Andalusian' },
      ],
    },
    {
      title: 'Future',
      items: [
        { image: '/images/High-Tech.webp', title: 'High-Tech' },
        { image: '/images/Futuristic.webp', title: 'Futuristic' },
        { image: '/images/Postmodern.webp', title: 'Postmodern' },
        { image: '/images/Steampunk.webp', title: 'Steampunk' },
      ],
    },
    {
      title: 'Retro',
      items: [
        { image: '/images/Retro_60s.webp', title: 'Retro 60s' },
        { image: '/images/Retro_70s.webp', title: 'Retro 70s' },
        { image: '/images/Retro_80s.webp', title: 'Retro 80s' },
        { image: '/images/Retro_90s.webp', title: 'Retro 90s' },
      ],
    },
  ],
  occasions: [
    {
      title: 'Family',
      items: [
        { image: '/images/Birthday.webp', title: 'Birthday' },
        { image: '/images/Baby_Shower.webp', title: 'Baby Shower' },
        {
          image: '/images/Gender_Reveal_Party.webp',
          title: 'Gender Reveal Party',
        },
        { image: '/images/Graduation.webp', title: 'Graduation' },
        { image: '/images/Housewarming.webp', title: 'Housewarming' },
      ],
    },
    {
      title: 'Love',
      items: [
        { image: '/images/Wedding.webp', title: 'Wedding' },
        { image: '/images/Engagement.webp', title: 'Engagement' },
        { image: '/images/Anniversary.webp', title: 'Anniversary' },
        { image: '/images/Valentines_Day.webp', title: "Valentine's Day" },
      ],
    },
    {
      title: 'Holidays',
      items: [
        { image: '/images/Christmas.webp', title: 'Christmas' },
        { image: '/images/New_Years_Eve.webp', title: "New Year's Eve" },
        { image: '/images/Lunar_New_Year.webp', title: 'Lunar New Year' },
        { image: '/images/Easter.webp', title: 'Easter' },
        { image: '/images/Halloween.webp', title: 'Halloween' },
        { image: '/images/Thanksgiving.webp', title: 'Thanksgiving' },
        { image: '/images/Diwali.webp', title: 'Diwali' },
        { image: '/images/Ramadan.webp', title: 'Ramadan' },
        { image: '/images/Eid.webp', title: 'Eid' },
        { image: '/images/Hanukkah.webp', title: 'Hanukkah' },
      ],
    },
    {
      title: 'Sports',
      items: [
        { image: '/images/Super_Bowl.webp', title: 'Super Bowl' },
        { image: '/images/World_Cup_Final.webp', title: 'World Cup Final' },
      ],
    },
    {
      title: 'National',
      items: [
        { image: '/images/4th_of_July.webp', title: '4th of July' },
        { image: '/images/St_Patricks_Day.webp', title: "St. Patrick's Day" },
        { image: '/images/Cinco_de_Mayo.webp', title: 'Cinco de Mayo' },
        { image: '/images/Pride_Month.webp', title: 'Pride Month' },
      ],
    },
  ],
  locations: [
    {
      title: 'World',
      badges: [
        'African', 'American', 'Australian', 'Belgian', 'Arabian', 'Moroccan',
        'Parisian', 'Provence', 'Alpine', 'New York', 'New Zealand', 'London',
        'Lisbon', 'Venetian', 'Californian', 'Texan', 'Tuscan', 'Miami',
        'Mexican', 'Cuba', 'Caribbean', 'Milan', 'Tokyo', 'Ryokan',
        'Shanghai', 'South Korean', 'North Korean', 'Bali', 'Santorini',
        'Ibiza', 'India', 'Scandi', 'Nordic',
      ],
    },
  ],
  themes: [
    {
      title: 'Pop Culture',
      badges: [
        'Harry Potter', 'Barbie', 'Cyberpunk', 'Peaky Blinders', 'Dune',
        'Game of Thrones', 'The Lord of the Rings', 'Friends', 'The Matrix',
        'Stranger Things', 'Avatar', 'Breaking Bad', 'The Simpsons',
        'Futurama', 'Rick and Morty', 'SpongeBob', 'Studio Ghibli',
        'Star Wars (The Mandalorian)', 'Blade Runner 2049', 'Interstellar',
        'The Great Gatsby', 'The Godfather', 'Titanic', 'Fight Club',
        'Joker / Batman', 'The Martian', 'Wes Anderson', 'Minecraft',
        'Pixar', 'Tim Burton', 'Anime/Manga',
      ],
    },
  ],
  enhance: [
    {
      title: 'Remove',
      badges: ['Remove Furniture', 'Remove Clutter', 'Remove People', 'Remove Cars'],
    },
    {
      title: 'Relight',
      badges: ['Cinematic Light', 'Evening Light', 'Golden Hour', 'Overcast Light'],
    },
  ],
  finalize: [
    {
      title: 'Rebuild',
      badges: ['UpScale', 'ProPhoto'],
    },
    {
      title: 'Recolor',
      badges: [
        'Neutral', 'Sand', 'Mono', 'Contrast', 'Luxury', 'Warmth', 'Classic',
        'Heat', 'Balance', 'Gold', 'Copper', 'Navy', 'Sage', 'Dark',
        'Heritage', 'Greige', 'Blush', 'Emerald', 'Gray', 'Prime',
      ],
    },
    {
      title: 'Camera Views',
      badges: [
        "Worm's-eye", 'Straight', 'Medium', 'High', "Bird's-eye", 'Wide',
        'Dutch (left)', 'Dutch (right)', 'Left-side', 'Right-side', 'Close-up',
        'Tilt-shift', 'Extreme close-up', 'Detail shot', 'Macro shot', 'Extreme macro',
      ],
    },
    {
      title: 'Aspect Ratio',
      badges: ['16:9', '9:16', '1:1', '4:5', '3:2', '4:3', '3:4', '5:4', '2:3', '21:9'],
    },
  ],
};
