BEGIN;

DROP TABLE IF EXISTS user_notes, order_items, orders, products, users, companies CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'USER');
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

CREATE TABLE companies (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(120) NOT NULL UNIQUE,
    industry     VARCHAR(80) NOT NULL,
    country      VARCHAR(80) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    first_name    VARCHAR(80) NOT NULL,
    last_name     VARCHAR(80) NOT NULL,
    email         VARCHAR(180) NOT NULL UNIQUE,
    company_id    BIGINT NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    role          user_role NOT NULL DEFAULT 'USER',
    date_of_birth DATE NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_date_of_birth_not_future CHECK (date_of_birth <= CURRENT_DATE)
);

CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(140) NOT NULL,
    category    VARCHAR(80) NOT NULL,
    price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      order_status NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0)
);

CREATE TABLE user_notes (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note        TEXT NOT NULL CHECK (char_length(trim(note)) > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_last_name_first_name ON users(last_name, first_name);
CREATE INDEX idx_users_email_lower ON users((lower(email)));
CREATE INDEX idx_orders_user_id_created_at ON orders(user_id, created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_user_notes_user_id_created_at ON user_notes(user_id, created_at DESC);

INSERT INTO companies (name, industry, country)
SELECT
    'Company ' || lpad(gs::text, 2, '0'),
    (ARRAY['Renewable Energy','Software','Manufacturing','Financial Services','Logistics','Retail','Telecommunications','Healthcare'])[((gs - 1) % 8) + 1],
    (ARRAY['South Africa','United Kingdom','Germany','Netherlands','Australia','United States','Kenya','Namibia'])[((gs - 1) % 8) + 1]
FROM generate_series(1, 40) gs;

INSERT INTO products (name, category, price)
SELECT
    (ARRAY['Atlas','Nova','Pulse','Vector','Helix','Orbit','Vertex','Nimbus','Forge','Echo'])[((gs - 1) % 10) + 1]
      || ' ' ||
    (ARRAY['Monitor','Keyboard','Dock','Headset','Router','Sensor','Controller','Tablet','Gateway','Camera'])[((gs - 1) % 10) + 1]
      || ' ' || gs,
    (ARRAY['Computing','Accessories','Networking','Industrial','Office','Mobile','Security','Sensors'])[((gs - 1) % 8) + 1],
    round((75 + ((gs * 37) % 4900) + ((gs % 99)::numeric / 100))::numeric, 2)
FROM generate_series(1, 200) gs;

WITH first_names AS (
    SELECT ARRAY['Aiden','Amara','Benjamin','Bianca','Caleb','Carla','Daniel','Dineo','Ethan','Fatima','Grace','Hannah','Isaac','Jade','Jason','Karabo','Lebo','Liam','Maya','Michael','Naledi','Noah','Olivia','Priya','Rethabile','Ryan','Sam','Sarah','Sipho','Sofia','Thabo','Zoe'] AS v
), last_names AS (
    SELECT ARRAY['Adams','Botha','Brown','Campbell','Daniels','Dlamini','Evans','Fourie','Govender','Harris','Jacobs','Khan','Khumalo','King','Lewis','Mahlangu','Mokoena','Naidoo','Nel','Nkosi','Patel','Petersen','Smith','Steyn','Taylor','Thomas','Van Wyk','Williams','Wilson','Zwane'] AS v
)
INSERT INTO users (first_name, last_name, email, company_id, role, date_of_birth, is_active, created_at, updated_at)
SELECT
    fn.v[((gs - 1) % array_length(fn.v, 1)) + 1],
    ln.v[(((gs * 7) - 1) % array_length(ln.v, 1)) + 1],
    lower(fn.v[((gs - 1) % array_length(fn.v, 1)) + 1] || '.' || ln.v[(((gs * 7) - 1) % array_length(ln.v, 1)) + 1] || gs || '@example.test'),
    ((gs * 13) % 40) + 1,
    CASE WHEN gs % 29 = 0 THEN 'ADMIN'::user_role WHEN gs % 7 = 0 THEN 'MANAGER'::user_role ELSE 'USER'::user_role END,
    DATE '1960-01-01' + ((gs * 41) % 16000),
    gs % 17 <> 0,
    TIMESTAMPTZ '2023-01-01 08:00:00+00' + ((gs * 17) % 1200) * INTERVAL '1 day' + (gs % 24) * INTERVAL '1 hour',
    TIMESTAMPTZ '2025-01-01 08:00:00+00' + ((gs * 11) % 580) * INTERVAL '1 day'
FROM generate_series(1, 1500) gs
CROSS JOIN first_names fn
CROSS JOIN last_names ln;

INSERT INTO orders (user_id, status, created_at)
SELECT
    ((gs * 19) % 1500) + 1,
    CASE
      WHEN gs % 17 = 0 THEN 'CANCELLED'::order_status
      WHEN gs % 9 = 0 THEN 'PENDING'::order_status
      WHEN gs % 5 = 0 THEN 'PROCESSING'::order_status
      ELSE 'COMPLETED'::order_status
    END,
    TIMESTAMPTZ '2024-01-01 09:00:00+00' + ((gs * 13) % 950) * INTERVAL '1 day' + (gs % 12) * INTERVAL '1 hour'
FROM generate_series(1, 5000) gs;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
    ((gs - 1) % 5000) + 1,
    ((gs * 23) % 200) + 1,
    ((gs * 3) % 5) + 1,
    p.price
FROM generate_series(1, 17500) gs
JOIN products p ON p.id = ((gs * 23) % 200) + 1;

INSERT INTO user_notes (user_id, note, created_at)
SELECT
    ((gs * 31) % 1500) + 1,
    (ARRAY[
      'Requested a follow-up regarding account access.',
      'Prefers email communication for non-urgent updates.',
      'Discussed a billing query with support.',
      'Account details were reviewed and confirmed.',
      'Asked for product information before the next purchase.',
      'Internal note: verify company details during next interaction.'
    ])[((gs - 1) % 6) + 1],
    TIMESTAMPTZ '2025-01-01 10:00:00+00' + ((gs * 29) % 580) * INTERVAL '1 day'
FROM generate_series(1, 2400) gs;

COMMIT;
