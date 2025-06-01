#[derive(Accounts)]
pub struct CreatePassport<'info> {
    #[account(
        init,
        payer = manufacturer,
        space = 8 + Passport::LEN,
        seeds = [b"passport", serial_number.as_bytes()],
        bump
    )]
    pub passport: Account<'info, Passport>,
    #[account(mut)]
    pub manufacturer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Passport {
    pub serial_number: String,
    pub production_date: String,
    pub device_model: String,
    pub warranty_period: String,
    pub country_of_origin: String,
    pub manufacturer_id: String,
    pub ipfs_cid: String,
    pub owner: Pubkey,
}

impl Passport {
    pub const LEN: usize = 32 + // serial_number
        32 + // production_date
        32 + // device_model
        32 + // warranty_period
        32 + // country_of_origin
        32 + // manufacturer_id
        32 + // ipfs_cid
        32;  // owner
}

#[account]
pub struct Manufacturer {
    pub name: String,
    pub pubkey: Pubkey,
}

impl Manufacturer {
    pub const LEN: usize = 32 + // name
        32;  // pubkey
}

#[account]
pub struct ManufacturerList {
    pub manufacturers: Vec<Manufacturer>,
}

impl ManufacturerList {
    pub const LEN: usize = 4 + // vec length
        (Manufacturer::LEN * 100); // space for up to 100 manufacturers
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + ManufacturerList::LEN,
        seeds = [b"manufacturer_list"],
        bump
    )]
    pub manufacturer_list: Account<'info, ManufacturerList>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddManufacturer<'info> {
    #[account(
        mut,
        seeds = [b"manufacturer_list"],
        bump
    )]
    pub manufacturer_list: Account<'info, ManufacturerList>,
    pub admin: Signer<'info>,
}

pub fn add_manufacturer(ctx: Context<AddManufacturer>, manufacturer: Pubkey, name: String) -> Result<()> {
    let manufacturer_list = &mut ctx.accounts.manufacturer_list;
    
    // Перевіряємо чи виробник вже існує
    for m in &manufacturer_list.manufacturers {
        if m.pubkey == manufacturer {
            return Err(ErrorCode::ManufacturerAlreadyExists.into());
        }
    }
    
    // Додаємо нового виробника
    manufacturer_list.manufacturers.push(Manufacturer {
        name,
        pubkey: manufacturer,
    });
    
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Manufacturer already exists in the list")]
    ManufacturerAlreadyExists,
} 