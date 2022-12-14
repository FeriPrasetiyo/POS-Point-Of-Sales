
-- PEMBELIAN KE SUPLAYER
    DECLARE
    stock_lama INTEGER;
    total_harga NUMERIC;
	current_invoice TEXT;
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = NEW.itemcode;
            UPDATE goods SET stock = stock_lama + NEW.quantity WHERE barcode = NEW.itemcode;
			current_invoice := NEW.invoice;
			
        ELSIF (TG_OP = 'UPDATE') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = NEW.itemcode;
            UPDATE goods SET stock = stock_lama - OLD.quantity + NEW.quantity WHERE barcode = NEW.itemcode;
			current_invoice := NEW.invoice;
	

        ELSIF (TG_OP = 'DELETE') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = OLD.itemcode;
            UPDATE goods SET stock = stock_lama - OLD.quantity WHERE barcode = OLD.itemcode;
			current_invoice := OLD.invoice;
        END IF;
		
        SELECT coalesce(sum(totalprice), 0) INTO total_harga FROM purchaseitems WHERE invoice = current_invoice;
        UPDATE purchases set totalsum = total_harga WHERE invoice = current_invoice;

        RETURN NULL;
    END;


-- UPDATE HARGA
    DECLARE
        price_item NUMERIC;
    BEGIN
        SELECT purchaseprice INTO price_item FROM goods WHERE barcode = NEW.itemcode;
        NEW.purchaseprice := price_item;
        NEW.totalprice := NEW.quantity * price_item;
            RETURN NEW;
    END;

-- invoice sesuai tanggal
BEGIN
   IF EXISTS(SELECT invoice FROM purchases WHERE invoice = 'INV-' || to_char(current_date, 'YYYYMMDD') || -1) THEN
      return 'INV-' || to_char(current_date, 'YYYYMMDD') || - nextval('invoice_seq');
   ELSE
   	ALTER SEQUENCE invoice_seq RESTART WITH 1;
      return 'INV-' || to_char(current_date, 'YYYYMMDD') || - nextval('invoice_seq');
   END IF;
END

-- PEMBELIAN KE SALES

CREATE OR REPLACE FUNCTION update_sales() RETURNS TRIGGER AS $audit_penjualan$
    DECLARE
    stock_lama INTEGER;
    total_harga NUMERIC;
	current_invoice TEXT;
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = NEW.itemcode;
            UPDATE goods SET stock = stock_lama - NEW.quantity WHERE barcode = NEW.itemcode;
			current_invoice := NEW.invoice;
			
        ELSIF (TG_OP = 'UPDATE') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = NEW.itemcode;
            UPDATE goods SET stock = stock_lama + OLD.quantity - NEW.quantity WHERE barcode = NEW.itemcode;
			current_invoice := NEW.invoice;
	

        ELSIF (TG_OP = 'DELETE') THEN
            SELECT stock INTO stock_lama FROM goods WHERE barcode = OLD.itemcode;
            UPDATE goods SET stock = stock_lama + OLD.quantity WHERE barcode = OLD.itemcode;
			current_invoice := OLD.invoice;
        END IF;
		
        SELECT coalesce(sum(totalprice), 0) INTO total_harga FROM saleitems WHERE invoice = current_invoice;
        UPDATE sales set totalsum = total_harga WHERE invoice = current_invoice;

        RETURN NULL;
    END;
$audit_penjualan$ LANGUAGE plpgsql;

CREATE TRIGGER audit_penjualan
AFTER INSERT OR UPDATE OR DELETE ON saleitems
    FOR EACH ROW EXECUTE FUNCTION update_sales();


-- update harga sales
CREATE OR REPLACE FUNCTION update_harga_sales() RETURNS TRIGGER AS $set_total_sales$
    DECLARE
        price_item_sales NUMERIC;
    BEGIN
        SELECT sellingprice INTO price_item_sales FROM goods WHERE barcode = NEW.itemcode;
        NEW.purchaseprice := price_item_sales;
        NEW.totalprice := NEW.quantity * price_item_sales;
            RETURN NEW;
    END;
$set_total_sales$ LANGUAGE plpgsql;

CREATE TRIGGER set_total_sales
BEFORE INSERT OR UPDATE OR DELETE ON saleitems
    FOR EACH ROW EXECUTE FUNCTION update_harga_sales();