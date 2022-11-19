CREATE OR REPLACE FUNCTION update_purchases() RETURNS TRIGGER AS $set_purchases$
    DECLARE
    stock_lama INTEGER;
    total_harga NUMERIC;
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = NEW.itemcode;
            UPDATE goods SET stok = stock_lama - NEW.quantity WHERE barcode = NEW.itemcode;

        ELSIF (TG_OP = 'UPDATE') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = NEW.itemcode;
            UPDATE goods SET stok = stock_lama + OLD.quantity - NEW.quantity WHERE barcode = NEW.itemcode;

        ELSIF (TG_OP = 'DELETE') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = NEW.itemcode;
            UPDATE goods SET stok = stock_lama + NEW.quantity WHERE barcode = NEW.itemcode;

        END IF;
        SELECT sum(totalprice) INTO total_harga FROM purchaseitems WHERE invoice = NEW.invoice;
        UPDATE purchases set totalsum = total_harga WHERE invoice = NEW.invoice;

        RETRUN NULL
    END;
$set_purchases$ LANGUAGE plpgsql;

CREATE TRIGGER set_purchases
AFTER INSERT OR UPDATE OR DELETE ON purchaseitems
    FOR EACH ROW EXECUTE FUNCTION update_purchases();

-- UPDATE HARGA
CREATE OR REPLACE FUNCTION update_harga() RETURNS TRIGGER AS $set_total_harga$
    DECLARE
        price_item NUMERIC;
    BEGIN
        SELECT purchaseprice INTO price_item FROM goods WHERE barcode = NEW.itemcode;
        NEW.purchaseprice := price_item
        NEW.totalprice := NEW.quantity * NEW.price_item;
            RETURN NEW;
        RETRUN NULL
    END;
$set_total_harga$ LANGUAGE plpgsql;

CREATE TRIGGER set_total_harga
BEFORE INSERT OR UPDATE OR DELETE ON purchaseitems
    FOR EACH ROW EXECUTE FUNCTION update_harga();