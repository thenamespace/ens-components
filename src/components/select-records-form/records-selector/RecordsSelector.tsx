import { EnsAddressRecord, EnsTextRecord } from "@/types";
import "./RecordsSelector.css";
import { Button, Icon, IconName, Input, Text } from "@/components/atoms";
import { useMemo, useState } from "react";
import { LucideIceCream } from "lucide-react";
import { SupportedTextRecord, supportedTexts, TextRecordCategory } from "@/constants";

interface RecordsSelectorProps {
    texts: EnsTextRecord[]
    addresses: EnsAddressRecord[]
    onTextSelected: (record: EnsTextRecord, isRemoved: boolean) => void
    onAddressSelected: (record: EnsAddressRecord, isRemoved: boolean) => void
    onClose: () => void
}

enum SidebarNavItem {
    General = "General",
    Social = "Social",
    Addresses = "Addresses",
    Website = "Website"
}

const navIcons: Record<SidebarNavItem, IconName> = {
    "General": "box",
    "Social": "square-user",
    "Addresses": "pin",
    "Website": "globe"
}

export const RecordsSelector = ({

    onClose
}: RecordsSelectorProps) => {

    const [selectedTexts, setSelectedTexts] = useState<EnsTextRecord[]>([])
    const [selectedAddresses, setSelectedAddresses] = useState<EnsAddressRecord[]>([])
    const [currentNav, setCurrentNav] = useState<SidebarNavItem>(SidebarNavItem.General)

    const textRecordMap = useMemo<Record<"General" | "Social",SupportedTextRecord[]>>(() => {

        const records: Record<"General" | "Social",SupportedTextRecord[]> = {
            General: supportedTexts.filter(txt => txt.category === TextRecordCategory.General),
            Social: supportedTexts.filter(txt => txt.category === TextRecordCategory.Social)
        }
    
        return records;
    },[])



    return <div className="ns-records-selector">
        <div onClick={onClose} className="ns-mb-3 text-center" style={{textAlign: "center"}}>
            <Icon name="x"></Icon>
            <Text size="lg" weight="bold">Add Records</Text>
            <Text color="grey" size="sm" weight="medium">Lorem ipusm doalr sit amer</Text>
        </div>
        <div className="ns-mb-3">
            <Input prefix={<Icon size={18} name="search"/>} placeholder="Search"/>
        </div>
        <div className="ns-records-sidebar row">
            <div className="col-4">
                {Object.keys(SidebarNavItem).map(sideItem => {
                    
                    const item = sideItem as SidebarNavItem;
                    const activeClass = item === currentNav ? "active" : ""
                    
                    return <div onClick={() => setCurrentNav(item)} key={sideItem} className={`sidebar-item d-flex align-items-center ${activeClass}`}>
                    <Icon className="ns-me-1" size={16} name={navIcons[item]}/>
                    <Text size="sm" weight="medium">{item}</Text>
                </div>
                })}
            </div>
            <div className="col-8 ns-records-content">
                <div className="ns-records-selector-category">
                    <Text className="ns-mb-1" weight="bold">General</Text>
                     <>
                      {textRecordMap.General.map(item => <div className="text-record" key={item.key}>
                        <Text weight="medium" size="sm">{item.label}</Text>
                      </div>)}
                    </>
                </div>
                <div className="ns-records-selector-category">
                    <Text className="ns-mb-1" weight="bold">Social</Text>
                     <>
                      {textRecordMap.Social.map(item => <div className="text-record" key={item.key}>
                        <Text weight="medium" size="sm">{item.label}</Text>
                      </div>)}
                    </>
                </div>
            </div>
        </div>
        <div className="ns-mt-3">
            <Button style={{width: "50%"}} size="lg" onClick={() => onClose()} className="pe-2" variant="outline">Cancel</Button>
            <Button style={{width: "50%"}} size="lg">Add</Button>
        </div>
    </div>
}