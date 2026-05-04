import { ClubMemberRoleType } from "@/generated/prisma";
import prisma from "../db/prisma";
import { ROLE_TYPE_LABELS } from "./memberConstants";

const BOARD_ROLES: ClubMemberRoleType[] = [
    ClubMemberRoleType.CHAIRMAN,
    ClubMemberRoleType.VICE_CHAIRMAN,
    ClubMemberRoleType.TREASURER,
    ClubMemberRoleType.BOARD_MEMBER,
    ClubMemberRoleType.BOARD_SUPPLEANT,
];

const BOARD_ROLE_SORT_ORDER: Record<ClubMemberRoleType, number> = {
    [ClubMemberRoleType.CHAIRMAN]: 10,
    [ClubMemberRoleType.VICE_CHAIRMAN]: 20,
    [ClubMemberRoleType.TREASURER]: 30,
    [ClubMemberRoleType.BOARD_MEMBER]: 40,
    [ClubMemberRoleType.BOARD_SUPPLEANT]: 50,
    [ClubMemberRoleType.REGULAR]: 999,
};

export interface PublicBoardContactDTO {
    id: string;
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    addressLine: string | null;
    postalCode: string | null;
    city: string | null;
    profileImageUrl: string | null;
    email: string | null;
    mobilePhone: string | null;
    memberRoleType: ClubMemberRoleType;
    roleLabel: string;
}

export async function getPublicBoardContacts(clubId: string): Promise<PublicBoardContactDTO[]> {
    const boardMembers = await prisma.clubMemberProfile.findMany({
        where: {
            clubId,
            memberStatus: "ACTIVE",
            memberRoleType: {
                in: BOARD_ROLES,
            },
        },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
        },
        orderBy: [
            { firstName: "asc" },
            { lastName: "asc" },
        ],
    });

    return boardMembers
        .map((member) => {
            const displayName =
                member.user.name ||
                [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
                "Bestyrelsesmedlem";

            return {
                id: member.id,
                displayName,
                firstName: member.firstName,
                lastName: member.lastName,
                addressLine: member.addressLine,
                postalCode: member.postalCode,
                city: member.city,
                profileImageUrl: member.profileImageUrl,
                email: member.user.email,
                mobilePhone: member.mobilePhone,
                memberRoleType: member.memberRoleType,
                roleLabel: ROLE_TYPE_LABELS[member.memberRoleType],
            };
        })
        .sort((a, b) => {
            const roleSort = BOARD_ROLE_SORT_ORDER[a.memberRoleType] - BOARD_ROLE_SORT_ORDER[b.memberRoleType];

            if (roleSort !== 0) return roleSort;

            return a.displayName.localeCompare(b.displayName, "da");
        });
}