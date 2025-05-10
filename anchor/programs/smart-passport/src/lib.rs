use anchor_lang::prelude::*;

declare_id!("8tdpknetCPXv5Ztk8yoJWceRCgCxp3T6U56TnUGk99t4");

#[program]
pub mod smart_passport {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let manufacturer_list = &mut ctx.accounts.manufacturer_list;
        manufacturer_list.manufacturers = vec![];
        Ok(())
    }

    pub fn add_manufacturer(ctx: Context<AddManufacturer>, manufacturer: Pubkey) -> Result<()> {
        let manufacturer_list = &mut ctx.accounts.manufacturer_list;
        manufacturer_list.manufacturers.push(manufacturer);
        Ok(())
    }

    pub fn create_passport(
        ctx: Context<CreatePassport>,
        serial_number: String,
        production_date: String,
        device_model: String,
        warranty_period: String,
        country_of_origin: String,
        manufacturer_id: String,
        ipfs_cid: String,
        owner: Pubkey,
    ) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        passport.serial_number = serial_number;
        passport.production_date = production_date;
        passport.device_model = device_model;
        passport.warranty_period = warranty_period;
        passport.country_of_origin = country_of_origin;
        passport.manufacturer_id = manufacturer_id;
        passport.ipfs_cid = ipfs_cid;
        passport.owner = owner;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 8 + 1024)]
    pub manufacturer_list: Account<'info, ManufacturerList>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddManufacturer<'info> {
    #[account(mut)]
    pub manufacturer_list: Account<'info, ManufacturerList>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreatePassport<'info> {
    #[account(init, payer = user, space = 8 + 1024)]
    pub passport: Account<'info, Passport>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ManufacturerList {
    pub manufacturers: Vec<Pubkey>,
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