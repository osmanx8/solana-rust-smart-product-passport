use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::{
    instruction::{create_metadata_accounts_v3},
    state::Creator,
};

declare_id!("SPPAssp0rt1111111111111111111111111111111111");

#[program]
pub mod smart_passport {
    use super::*;

    pub fn initialize_passport(
        ctx: Context<InitializePassport>,
        serial_number: String,
        production_date: String,
        device_model: String,
        warranty_period: String,
        country_of_origin: String,
        manufacturer_id: String,
        ipfs_cid: String,
    ) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        passport.serial_number = serial_number;
        passport.production_date = production_date;
        passport.device_model = device_model;
        passport.warranty_period = warranty_period;
        passport.country_of_origin = country_of_origin;
        passport.manufacturer_id = manufacturer_id;
        passport.ipfs_cid = ipfs_cid;
        passport.mint = ctx.accounts.mint.key();

        // Create NFT metadata using Metaplex
        let metadata_instruction = create_metadata_accounts_v3(
            mpl_token_metadata::id(),
            ctx.accounts.metadata.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.payer.key(),
            "Smart Product Passport".to_string(),
            "SPP".to_string(),
            ipfs_cid.clone(),
            Some(vec![Creator {
                address: ctx.accounts.payer.key(),
                verified: true,
                share: 100,
            }]),
            0,
            true,
            true,
            None,
            None,
            None,
        );

        anchor_lang::solana_program::program::invoke(
            &metadata_instruction,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePassport<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 128,
        seeds = [b"passport", mint.key().as_ref()],
        bump
    )]
    pub passport: Account<'info, ProductPassport>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
        mint::freeze_authority = payer,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = payer,
        token::mint = mint,
        token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,
    /// CHECK: Metaplex metadata account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct ProductPassport {
    pub mint: Pubkey,
    pub serial_number: String,
    pub production_date: String,
    pub device_model: String,
    pub warranty_period: String,
    pub country_of_origin: String,
    pub manufacturer_id: String,
    pub ipfs_cid: String,
}