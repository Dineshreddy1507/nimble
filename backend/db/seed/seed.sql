WITH merchant AS (
    INSERT INTO merchants (id, slug, display_name, merchant_password_hash, customer_password_hash)
    VALUES (
        '11111111-1111-1111-1111-111111111111',
        'paws-plus',
        'Paws Plus',
        '$2a$10$9nKLIiHLfRq.D2YV3Ms48ufkUWV4vx3xvdrUrO/WW0eQN.87LmD/y',
        '$2a$10$vwubHebeDg0J0Z8nlVdTdONFbTwU1RUxQVwFPtBxAWZ/xsWmqD3cy'
    )
    ON CONFLICT (slug) DO UPDATE
        SET display_name = EXCLUDED.display_name,
            merchant_password_hash = EXCLUDED.merchant_password_hash,
            customer_password_hash = EXCLUDED.customer_password_hash,
            updated_at = NOW()
    RETURNING id
)
INSERT INTO pets (id, merchant_id, name, species, age_years, description, image_path)
VALUES
    (
        '22222222-2222-2222-2222-222222222221',
        (SELECT id FROM merchant),
        'Cassie the Corgi',
        'DOG',
        3,
        'A sunshine-soaked corgi who loves greeting every shopper at the door.',
        'assets/pets/cassie.svg'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        (SELECT id FROM merchant),
        'Mochi the Tabby',
        'CAT',
        2,
        'Curious, cuddly, and convinced every keyboard is a bed.',
        'assets/pets/mochi.svg'
    ),
    (
        '22222222-2222-2222-2222-222222222223',
        (SELECT id FROM merchant),
        'Sprout the Tree Frog',
        'FROG',
        1,
        'A tiny lime-green explorer with a talent for dramatic leaps.',
        'assets/pets/sprout.svg'
    ),
    (
        '22222222-2222-2222-2222-222222222224',
        (SELECT id FROM merchant),
        'Nova the Husky',
        'DOG',
        4,
        'Adventure-ready husky with mismatched eyes and an impeccable howl.',
        'assets/pets/nova.svg'
    )
ON CONFLICT (id) DO NOTHING;
