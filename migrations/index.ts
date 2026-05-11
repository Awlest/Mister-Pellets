import * as migration_20260502_074301 from './20260502_074301';
import * as migration_20260502_102047 from './20260502_102047';
import * as migration_20260502_103121 from './20260502_103121';
import * as migration_20260502_112806 from './20260502_112806';
import * as migration_20260504_080000_mollie_migration from './20260504_080000_mollie_migration';
import * as migration_20260504_140000_products_diffusion_color from './20260504_140000_products_diffusion_color';
import * as migration_20260504_180000_products_color_variants from './20260504_180000_products_color_variants';
import * as migration_20260505_140000_products_heated_volume_m3 from './20260505_140000_products_heated_volume_m3';

export const migrations = [
  {
    up: migration_20260502_074301.up,
    down: migration_20260502_074301.down,
    name: '20260502_074301',
  },
  {
    up: migration_20260502_102047.up,
    down: migration_20260502_102047.down,
    name: '20260502_102047',
  },
  {
    up: migration_20260502_103121.up,
    down: migration_20260502_103121.down,
    name: '20260502_103121',
  },
  {
    up: migration_20260502_112806.up,
    down: migration_20260502_112806.down,
    name: '20260502_112806',
  },
  {
    up: migration_20260504_080000_mollie_migration.up,
    down: migration_20260504_080000_mollie_migration.down,
    name: '20260504_080000_mollie_migration',
  },
  {
    up: migration_20260504_140000_products_diffusion_color.up,
    down: migration_20260504_140000_products_diffusion_color.down,
    name: '20260504_140000_products_diffusion_color',
  },
  {
    up: migration_20260504_180000_products_color_variants.up,
    down: migration_20260504_180000_products_color_variants.down,
    name: '20260504_180000_products_color_variants',
  },
  {
    up: migration_20260505_140000_products_heated_volume_m3.up,
    down: migration_20260505_140000_products_heated_volume_m3.down,
    name: '20260505_140000_products_heated_volume_m3',
  },
];
