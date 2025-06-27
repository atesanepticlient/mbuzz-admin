import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET endpoint to fetch all settings
export async function GET() {
  try {
    const [siteSettings, bonusSettings] = await Promise.all([
      db.siteSetting.findFirst(),
      db.bonus.findFirst(),
    ]);

    return NextResponse.json({
      siteSettings: siteSettings || {},
      bonusSettings: bonusSettings || {},
    });
  } catch  {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update site settings
export async function PATCH(request: Request) {
  try {
    const { siteSettings, bonusSettings } = await request.json();

    // Update site settings
    const updatedSiteSettings = await db.siteSetting.upsert({
      where: { id: siteSettings.id || "" },
      update: siteSettings,
      create: siteSettings,
    });

    // Update bonus settings
    const updatedBonusSettings = await db.bonus.upsert({
      where: { id: bonusSettings.id || "" },
      update: bonusSettings,
      create: bonusSettings,
    });

    return NextResponse.json({
      siteSettings: updatedSiteSettings,
      bonusSettings: updatedBonusSettings,
    });
  } catch  {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
